import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BugOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExportOutlined,
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { Button, Input, Space, Tabs, Tooltip } from 'antd'
import { WebviewTag } from 'electron'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const NavBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--color-bg-1);
  border-bottom: 1px solid var(--color-border);
  -webkit-app-region: drag; /* 允许拖动窗口 */
`

const AddressBar = styled(Input)`
  flex: 1;
  margin: 0 12px;
  max-width: calc(75% - 320px); // 减少四分之一的长度
  -webkit-app-region: no-drag; /* 确保输入框可以正常交互 */
`

const TabsContainer = styled.div`
  background-color: var(--color-bg-1);
  border-bottom: 1px solid var(--color-border);

  .ant-tabs-nav {
    margin-bottom: 0;
  }

  .ant-tabs-tab {
    padding: 8px 16px;

    .anticon-close {
      margin-left: 8px;
      font-size: 12px;
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }

  .add-tab-button {
    margin: 0 8px;
    padding: 0 8px;
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
    }
  }
`

const WebviewContainer = styled.div`
  flex: 1;
  height: calc(100% - 90px); // 调整高度以适应选项卡
  position: relative;

  .webview-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    z-index: 1;

    &.active {
      visibility: visible;
      z-index: 2;
    }
  }

  & webview {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
  }
`

const GoogleLoginTip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  z-index: 1000;
  display: flex;
  justify-content: center;

  .tip-content {
    max-width: 600px;
    text-align: center;

    p {
      margin-bottom: 10px;
    }
  }
`

// 全局变量，控制是否禁用安全限制
const DISABLE_SECURITY = true // 设置为true表示禁用安全限制，false表示启用安全限制

// 定义选项卡接口
interface Tab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
}

const Browser = () => {
  const { t } = useTranslation()

  // 从本地存储加载选项卡状态
  const loadTabsFromStorage = (): { tabs: Tab[]; activeTabId: string } => {
    try {
      const savedTabs = localStorage.getItem('browser_tabs')
      const savedActiveTabId = localStorage.getItem('browser_active_tab_id')

      if (savedTabs && savedActiveTabId) {
        // 解析保存的选项卡
        const parsedTabs = JSON.parse(savedTabs) as Tab[]

        // 验证选项卡数据
        const validTabs = parsedTabs.filter(
          (tab) => tab && tab.id && tab.url && typeof tab.id === 'string' && typeof tab.url === 'string'
        )

        // 确保至少有一个选项卡
        if (validTabs.length > 0) {
          // 验证活动选项卡ID
          const isActiveTabValid = validTabs.some((tab) => tab.id === savedActiveTabId)
          const finalActiveTabId = isActiveTabValid ? savedActiveTabId : validTabs[0].id

          console.log('Loaded tabs from storage:', validTabs.length, 'tabs, active tab:', finalActiveTabId)

          return {
            tabs: validTabs,
            activeTabId: finalActiveTabId
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tabs from storage:', error)
    }

    // 默认选项卡
    const defaultTabs = [
      {
        id: '1',
        title: 'Google',
        url: 'https://www.google.com',
        isLoading: false,
        canGoBack: false,
        canGoForward: false
      }
    ]

    console.log('Using default tabs')

    return {
      tabs: defaultTabs,
      activeTabId: '1'
    }
  }

  // 保存选项卡状态到本地存储
  const saveTabsToStorage = (tabs: Tab[], activeTabId: string) => {
    try {
      // 确保只保存当前有效的选项卡
      const validTabs = tabs.filter((tab) => tab && tab.id && tab.url)

      // 确保activeTabId是有效的
      const isActiveTabValid = validTabs.some((tab) => tab.id === activeTabId)
      const finalActiveTabId = isActiveTabValid ? activeTabId : validTabs.length > 0 ? validTabs[0].id : ''

      // 保存到localStorage
      localStorage.setItem('browser_tabs', JSON.stringify(validTabs))
      localStorage.setItem('browser_active_tab_id', finalActiveTabId)

      console.log('Saved tabs to storage:', validTabs.length, 'tabs, active tab:', finalActiveTabId)
    } catch (error) {
      console.error('Failed to save tabs to storage:', error)
    }
  }

  // 选项卡状态管理
  const initialTabState = loadTabsFromStorage()
  const [tabs, setTabs] = useState<Tab[]>(initialTabState.tabs)
  const [activeTabId, setActiveTabId] = useState(initialTabState.activeTabId)

  // 获取当前活动选项卡
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0]

  // 兼容旧代码的状态，只使用setter
  const [, setUrl] = useState(activeTab.url)
  const [currentUrl, setCurrentUrl] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 使用对象存储多个webview引用 - 使用useRef确保在组件重新渲染时保持引用
  const webviewRefs = useRef<Record<string, WebviewTag | null>>({})

  // 使用useRef保存webview的会话状态
  const webviewSessionsRef = useRef<Record<string, boolean>>({})

  // 使用useRef保存事件监听器清理函数
  const cleanupFunctionsRef = useRef<Record<string, () => void>>({})

  // 获取当前活动的webview引用
  const webviewRef = {
    current: webviewRefs.current[activeTabId] || null
  } as React.RefObject<WebviewTag>

  // 创建一个函数来设置webview的所有事件监听器
  const setupWebviewListeners = (webview: WebviewTag, tabId: string) => {
    console.log('Setting up event listeners for tab:', tabId)

    // 处理加载开始事件
    const handleDidStartLoading = () => {
      // 只更新当前活动标签页的UI状态
      if (tabId === activeTabId) {
        setIsLoading(true)
      }

      // 更新选项卡状态
      updateTabInfo(tabId, { isLoading: true })
    }

    // 处理加载结束事件
    const handleDidStopLoading = () => {
      const currentURL = webview.getURL()

      // 只更新当前活动标签页的UI状态
      if (tabId === activeTabId) {
        setIsLoading(false)
        setCurrentUrl(currentURL)
      }

      // 更新选项卡状态
      updateTabInfo(tabId, {
        isLoading: false,
        url: currentURL,
        title: webview.getTitle() || currentURL,
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward()
      })
    }

    // 处理导航事件
    const handleDidNavigate = (e: any) => {
      const canGoBackStatus = webview.canGoBack()
      const canGoForwardStatus = webview.canGoForward()

      // 只更新当前活动标签页的UI状态
      if (tabId === activeTabId) {
        setCurrentUrl(e.url)
        setCanGoBack(canGoBackStatus)
        setCanGoForward(canGoForwardStatus)
      }

      // 更新选项卡状态
      updateTabInfo(tabId, {
        url: e.url,
        canGoBack: canGoBackStatus,
        canGoForward: canGoForwardStatus
      })
    }

    // 处理页内导航事件
    const handleDidNavigateInPage = (e: any) => {
      const canGoBackStatus = webview.canGoBack()
      const canGoForwardStatus = webview.canGoForward()

      // 只更新当前活动标签页的UI状态
      if (tabId === activeTabId) {
        setCurrentUrl(e.url)
        setCanGoBack(canGoBackStatus)
        setCanGoForward(canGoForwardStatus)
      }

      // 更新选项卡状态
      updateTabInfo(tabId, {
        url: e.url,
        canGoBack: canGoBackStatus,
        canGoForward: canGoForwardStatus
      })
    }

    // 处理页面标题更新事件
    const handlePageTitleUpdated = (e: any) => {
      // 更新选项卡标题
      updateTabInfo(tabId, { title: e.title })
    }

    // 处理网站图标更新事件
    const handlePageFaviconUpdated = (e: any) => {
      // 更新选项卡图标
      updateTabInfo(tabId, { favicon: e.favicons[0] })
    }

    // 处理DOM就绪事件
    const handleDomReady = () => {
      const captchaNotice = t('browser.captcha_notice')

      // 注入链接点击拦截脚本
      webview.executeJavaScript(`
        (function() {
          // 已经注入过脚本，不再重复注入
          if (window.__linkInterceptorInjected) return;
          window.__linkInterceptorInjected = true;

          // 创建一个全局函数，用于在控制台中调用以打开新标签页
          window.__openInNewTab = function(url, title) {
            console.log('OPEN_NEW_TAB:' + JSON.stringify({url: url, title: title || url}));
          };

          // 拦截所有链接点击
          document.addEventListener('click', function(e) {
            // 查找被点击的链接元素
            let target = e.target;
            while (target && target.tagName !== 'A') {
              target = target.parentElement;
              if (!target) return; // 不是链接，直接返回
            }

            // 找到了链接元素
            if (target.tagName === 'A' && target.href) {
              // 检查是否应该在新标签页中打开
              const inNewTab = e.ctrlKey || e.metaKey || target.target === '_blank';

              // 阻止默认行为
              e.preventDefault();
              e.stopPropagation();

              // 使用一个特殊的数据属性来标记这个链接
              const linkData = {
                url: target.href,
                title: target.textContent || target.title || target.href,
                inNewTab: inNewTab
              };

              // 将数据转换为字符串并存储在自定义属性中
              document.body.setAttribute('data-last-clicked-link', JSON.stringify(linkData));

              // 触发一个自定义事件
              const event = new CustomEvent('link-clicked', { detail: linkData });
              document.dispatchEvent(event);

              // 使用控制台消息通知Electron
              console.log('LINK_CLICKED:' + JSON.stringify(linkData));

              if (!inNewTab) {
                // 在当前标签页中打开链接
                window.location.href = target.href;
              }

              return false;
            }
          }, true);

          // 打印一条消息，确认链接拦截脚本已经注入
          console.log('Link interceptor script injected successfully');

          // 每5秒测试一次链接拦截功能
          setInterval(function() {
            console.log('Testing link interceptor...');

            // 尝试调用全局函数
            if (window.__openInNewTab) {
              console.log('Link interceptor is working!');

              // 创建一个测试链接
              const testLink = document.createElement('a');
              testLink.href = 'https://www.example.com';
              testLink.textContent = 'Test Link';
              testLink.target = '_blank'; // 在新标签页中打开

              // 添加到DOM中
              if (!document.getElementById('test-link-container')) {
                const container = document.createElement('div');
                container.id = 'test-link-container';
                container.style.position = 'fixed';
                container.style.top = '10px';
                container.style.right = '10px';
                container.style.zIndex = '9999';
                container.style.background = 'white';
                container.style.padding = '10px';
                container.style.border = '1px solid black';
                container.appendChild(testLink);
                document.body.appendChild(container);
              }

              // 模拟点击事件
              console.log('LINK_CLICKED:' + JSON.stringify({
                url: 'https://www.example.com',
                title: 'Test Link',
                inNewTab: true
              }));
            } else {
              console.log('Link interceptor is NOT working!');
            }
          }, 5000);
        })();
      `)

      // 注入浏览器模拟脚本
      webview.executeJavaScript(`
        try {
          // 覆盖navigator.userAgent
          Object.defineProperty(navigator, 'userAgent', {
            value: '${userAgent}',
            writable: false
          });

          // 覆盖navigator.platform
          Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            writable: false
          });

          // 覆盖navigator.plugins
          Object.defineProperty(navigator, 'plugins', {
            value: [
              { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
              { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' },
              { name: 'Native Client', filename: 'internal-nacl-plugin', description: 'Native Client' }
            ],
            writable: false
          });

          // 覆盖navigator.languages
          Object.defineProperty(navigator, 'languages', {
            value: ['zh-CN', 'zh', 'en-US', 'en'],
            writable: false
          });

          // 覆盖window.chrome
          window.chrome = {
            runtime: {},
            loadTimes: function() {},
            csi: function() {},
            app: {}
          };

          // 添加WebGL支持检测
          if (HTMLCanvasElement.prototype.getContext) {
            const origGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type, attributes) {
              if (type === 'webgl' || type === 'experimental-webgl' || type === 'webgl2') {
                const gl = origGetContext.call(this, type, attributes);
                if (gl) {
                  // 修改WebGL参数以模拟真实浏览器
                  const getParameter = gl.getParameter.bind(gl);
                  gl.getParameter = function(parameter) {
                    // UNMASKED_VENDOR_WEBGL
                    if (parameter === 37445) {
                      return 'Google Inc. (NVIDIA)';
                    }
                    // UNMASKED_RENDERER_WEBGL
                    if (parameter === 37446) {
                      return 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Direct3D11 vs_5_0 ps_5_0, D3D11)';
                    }
                    return getParameter(parameter);
                  };
                }
                return gl;
              }
              return origGetContext.call(this, type, attributes);
            };
          }

          // 添加音频上下文支持
          if (typeof AudioContext !== 'undefined') {
            const origAudioContext = AudioContext;
            window.AudioContext = function() {
              const context = new origAudioContext();
              return context;
            };
          }

          // 添加电池API模拟
          if (navigator.getBattery) {
            navigator.getBattery = function() {
              return Promise.resolve({
                charging: true,
                chargingTime: 0,
                dischargingTime: Infinity,
                level: 1.0,
                addEventListener: function() {},
                removeEventListener: function() {}
              });
            };
          }

          // 修复Cloudflare检测
          if (document.documentElement) {
            // 添加一些随机性，使每个浏览器实例看起来都不同
            const randomFactor = Math.floor(Math.random() * 10);

            // 修改屏幕分辨率
            Object.defineProperty(window, 'innerWidth', {
              get: function() { return 1920 + randomFactor; }
            });

            Object.defineProperty(window, 'innerHeight', {
              get: function() { return 1080 + randomFactor; }
            });

            Object.defineProperty(window, 'outerWidth', {
              get: function() { return 1920 + randomFactor; }
            });

            Object.defineProperty(window, 'outerHeight', {
              get: function() { return 1080 + randomFactor; }
            });

            Object.defineProperty(screen, 'width', {
              get: function() { return 1920; }
            });

            Object.defineProperty(screen, 'height', {
              get: function() { return 1080; }
            });

            Object.defineProperty(screen, 'availWidth', {
              get: function() { return 1920; }
            });

            Object.defineProperty(screen, 'availHeight', {
              get: function() { return 1040; }
            });

            // 修改时区
            Date.prototype.getTimezoneOffset = function() {
              return -480; // 中国标准时间 (UTC+8)
            };
          }

          console.log('Browser emulation script injected successfully');
        } catch (e) {
          console.error('Failed to inject browser emulation:', e);
        }
      `)

      // 检测验证码脚本
      const script = `
        // 检测是否存在Cloudflare验证码或其他验证码
        const hasCloudflareCaptcha = document.querySelector('iframe[src*="cloudflare"]') !== null ||
                                    document.querySelector('.cf-browser-verification') !== null ||
                                    document.querySelector('.cf-im-under-attack') !== null ||
                                    document.querySelector('#challenge-form') !== null ||
                                    document.querySelector('#challenge-running') !== null ||
                                    document.querySelector('#challenge-error-title') !== null ||
                                    document.querySelector('.ray-id') !== null ||
                                    document.querySelector('.hcaptcha-box') !== null ||
                                    document.querySelector('iframe[src*="hcaptcha"]') !== null ||
                                    document.querySelector('iframe[src*="recaptcha"]') !== null;

        // 如果存在验证码，添加一些辅助功能
        if (hasCloudflareCaptcha) {
          // 尝试自动点击"我是人类"复选框
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            if (checkbox.style.display !== 'none') {
              checkbox.click();
            }
          });

          // 添加一个提示，告诉用户需要手动完成验证
          const notificationDiv = document.createElement('div');
          notificationDiv.style.position = 'fixed';
          notificationDiv.style.top = '10px';
          notificationDiv.style.left = '50%';
          notificationDiv.style.transform = 'translateX(-50%)';
          notificationDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          notificationDiv.style.color = 'white';
          notificationDiv.style.padding = '10px 20px';
          notificationDiv.style.borderRadius = '5px';
          notificationDiv.style.zIndex = '9999999';
          notificationDiv.style.fontFamily = 'Arial, sans-serif';
          notificationDiv.textContent = "${captchaNotice}";

          document.body.appendChild(notificationDiv);

          // 5秒后自动隐藏提示
          setTimeout(() => {
            notificationDiv.style.opacity = '0';
            notificationDiv.style.transition = 'opacity 1s';
            setTimeout(() => {
              notificationDiv.remove();
            }, 1000);
          }, 5000);
        }
      `

      // 替换模板字符串中的变量
      const finalScript = script.replace('${captchaNotice}', captchaNotice)
      webview.executeJavaScript(finalScript)
    }

    // 处理新窗口打开请求
    const handleNewWindow = (e: any) => {
      e.preventDefault() // 阻止默认行为

      // 始终在新标签页中打开
      openUrlInTab(e.url, true, e.frameName || 'New Tab')
    }

    // 处理将要导航的事件
    const handleWillNavigate = (e: any) => {
      // 更新当前标签页的URL
      updateTabInfo(tabId, { url: e.url })
    }

    // 处理控制台消息事件 - 用于链接点击拦截
    const handleConsoleMessage = (event: any) => {
      // 打印所有控制台消息，便于调试
      console.log(`[Tab ${tabId}] Console message:`, event.message)

      // 处理新的链接点击消息
      if (event.message && event.message.startsWith('LINK_CLICKED:')) {
        try {
          const dataStr = event.message.replace('LINK_CLICKED:', '')
          const data = JSON.parse(dataStr)

          console.log(`[Tab ${tabId}] Link clicked:`, data)

          if (data.url && data.inNewTab) {
            // 在新标签页中打开链接
            console.log(`[Tab ${tabId}] Opening link in new tab:`, data.url)
            openUrlInTab(data.url, true, data.title || data.url)
          }
        } catch (error) {
          console.error('Failed to parse link data:', error)
        }
      }

      // 保留对旧消息格式的支持
      else if (event.message && event.message.startsWith('OPEN_NEW_TAB:')) {
        try {
          const dataStr = event.message.replace('OPEN_NEW_TAB:', '')
          const data = JSON.parse(dataStr)

          console.log(`[Tab ${tabId}] Opening link in new tab (legacy format):`, data)

          if (data.url) {
            // 在新标签页中打开链接
            openUrlInTab(data.url, true, data.title || data.url)
          }
        } catch (error) {
          console.error('Failed to parse link data:', error)
        }
      }
    }

    // 添加所有事件监听器
    webview.addEventListener('did-start-loading', handleDidStartLoading)
    webview.addEventListener('did-stop-loading', handleDidStopLoading)
    webview.addEventListener('did-navigate', handleDidNavigate)
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage)
    webview.addEventListener('dom-ready', handleDomReady)
    webview.addEventListener('page-title-updated', handlePageTitleUpdated)
    webview.addEventListener('page-favicon-updated', handlePageFaviconUpdated)
    webview.addEventListener('new-window', handleNewWindow)
    webview.addEventListener('will-navigate', handleWillNavigate)
    webview.addEventListener('console-message', handleConsoleMessage)

    // 返回清理函数
    return () => {
      console.log('Cleaning up event listeners for tab:', tabId)
      webview.removeEventListener('did-start-loading', handleDidStartLoading)
      webview.removeEventListener('did-stop-loading', handleDidStopLoading)
      webview.removeEventListener('did-navigate', handleDidNavigate)
      webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage)
      webview.removeEventListener('dom-ready', handleDomReady)
      webview.removeEventListener('page-title-updated', handlePageTitleUpdated)
      webview.removeEventListener('page-favicon-updated', handlePageFaviconUpdated)
      webview.removeEventListener('new-window', handleNewWindow)
      webview.removeEventListener('will-navigate', handleWillNavigate)
      webview.removeEventListener('console-message', handleConsoleMessage)
    }
  }

  // 通用的打开URL函数
  const openUrlInTab = (url: string, inNewTab: boolean = false, title: string = 'New Tab') => {
    if (inNewTab) {
      // 在新标签页中打开链接
      const newTabId = `tab-${Date.now()}`
      const newTab: Tab = {
        id: newTabId,
        title: title,
        url: url,
        isLoading: true,
        canGoBack: false,
        canGoForward: false
      }

      // 创建新的选项卡数组，确保不修改原数组
      const newTabs = [...tabs, newTab]

      // 更新状态
      setTabs(newTabs)
      setActiveTabId(newTabId)

      // 保存到本地存储
      saveTabsToStorage(newTabs, newTabId)

      console.log('Opened URL in new tab:', url, 'tab ID:', newTabId)
    } else {
      // 在当前标签页中打开链接
      setUrl(url)

      // 更新当前选项卡的URL
      updateTabInfo(activeTabId, { url: url })
    }
  }

  // 当activeTabId变化时，更新UI状态
  useEffect(() => {
    // 获取当前活动的webview
    const webview = webviewRefs.current[activeTabId]
    if (!webview) return

    // 从webview获取最新状态
    try {
      const currentURL = webview.getURL()
      if (currentURL && currentURL !== 'about:blank') {
        setCurrentUrl(currentURL)
      } else {
        // 如果没有有效URL，使用存储的URL
        const tab = tabs.find((tab) => tab.id === activeTabId)
        if (tab) {
          setCurrentUrl(tab.url)
        }
      }

      // 更新导航状态
      setCanGoBack(webview.canGoBack())
      setCanGoForward(webview.canGoForward())
      setIsLoading(webview.isLoading())
    } catch (error) {
      console.error('Error updating UI state:', error)
    }
  }, [activeTabId, tabs])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(e.target.value)
  }

  const handleUrlSubmit = () => {
    let processedUrl = currentUrl.trim()

    // 如果URL不包含协议，添加https://
    if (!/^https?:\/\//i.test(processedUrl)) {
      // 检查是否是搜索查询而不是URL
      if (!processedUrl.includes('.') || processedUrl.includes(' ')) {
        // 将输入视为搜索查询
        processedUrl = `https://www.google.com/search?q=${encodeURIComponent(processedUrl)}`
      } else {
        // 添加https://前缀
        processedUrl = `https://${processedUrl}`
      }
    }

    setUrl(processedUrl)
  }

  // 移除已弃用的handleKeyPress方法，直接使用onPressEnter

  const handleGoBack = () => {
    webviewRef.current?.goBack()
  }

  const handleGoForward = () => {
    webviewRef.current?.goForward()
  }

  const handleReload = () => {
    webviewRef.current?.reload()
  }

  const handleHome = () => {
    setUrl('https://www.google.com')
  }

  const handleOpenDevTools = () => {
    const webview = webviewRef.current
    if (webview) {
      webview.openDevTools()
    }
  }

  // 添加打开外部浏览器的功能
  const handleOpenExternal = () => {
    if (currentUrl && window.api && window.api.shell) {
      window.api.shell.openExternal(currentUrl)
    }
  }

  // 添加清除浏览器数据的功能
  const handleClearData = () => {
    if (window.api && window.api.ipcRenderer) {
      // 通过IPC调用主进程清除浏览器数据
      window.api.ipcRenderer.invoke('browser:clear-data').then(() => {
        // 重新加载当前页面
        if (webviewRef.current) {
          webviewRef.current.reload()
        }
      })
    }
  }

  // 使用与Sec-Ch-Ua匹配的用户代理字符串
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

  // 检测Google登录页面
  const [showGoogleLoginTip, setShowGoogleLoginTip] = useState(false)

  // 处理Google登录
  const handleGoogleLogin = () => {
    if (webviewRef.current) {
      // 使用Google移动版登录页面，检测可能不那么严格
      const mobileLoginUrl =
        'https://accounts.google.com/signin/v2/identifier?hl=zh-CN&flowName=GlifWebSignIn&flowEntry=ServiceLogin&service=mail&continue=https://mail.google.com/mail/&rip=1&TL=AM3QAYbxUXwQx_6Jq_0I5HwQZvPcnVOJ1mKZQjwPXpR7LWiKGdz8ZLVEwgfTUPg4&platform=mobile'
      webviewRef.current.loadURL(mobileLoginUrl)
    }
  }

  // 选项卡管理功能
  const handleAddTab = (url: string = 'https://www.google.com', title: string = 'New Tab') => {
    const newTabId = `tab-${Date.now()}`
    const newTab: Tab = {
      id: newTabId,
      title: title,
      url: url,
      isLoading: false,
      canGoBack: false,
      canGoForward: false
    }

    const newTabs = [...tabs, newTab]
    setTabs(newTabs)
    setActiveTabId(newTabId)
    setUrl(url)

    // 保存到本地存储
    saveTabsToStorage(newTabs, newTabId)

    return newTabId
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation() // 防止触发选项卡切换
    console.log('Closing tab:', tabId)

    if (tabs.length === 1) {
      // 如果只有一个选项卡，创建一个新的空白选项卡
      handleAddTab()
      return // 已经在handleAddTab中保存了状态，这里直接返回
    }

    // 计算新的活动选项卡ID
    let newActiveTabId = activeTabId
    if (tabId === activeTabId) {
      const currentIndex = tabs.findIndex((tab) => tab.id === tabId)
      const newActiveIndex = currentIndex === 0 ? 1 : currentIndex - 1
      newActiveTabId = tabs[newActiveIndex].id
      setActiveTabId(newActiveTabId)
    }

    // 从选项卡列表中移除
    const newTabs = tabs.filter((tab) => tab.id !== tabId)
    setTabs(newTabs)

    // 清理不再使用的webview引用和会话状态
    if (webviewRefs.current[tabId]) {
      // 停止加载并清理webview
      try {
        const webview = webviewRefs.current[tabId]
        if (webview) {
          // 停止加载
          webview.stop()

          // 尝试获取webContentsId
          try {
            const webContentsId = webview.getWebContentsId()
            if (webContentsId && window.api && window.api.ipcRenderer) {
              // 通过IPC请求主进程销毁webContents
              window.api.ipcRenderer
                .invoke('browser:destroy-webcontents', webContentsId)
                .then(() => {
                  console.log('Successfully requested destruction of webContents for tab:', tabId)
                })
                .catch((error) => {
                  console.error('Error requesting destruction of webContents:', error)
                })
            }
          } catch (e) {
            console.error('Error getting webContentsId:', e)
          }

          // 加载空白页面，释放资源
          webview.src = 'about:blank'

          // 使用保存的清理函数移除事件监听器
          if (cleanupFunctionsRef.current[tabId]) {
            console.log('Calling cleanup function for tab:', tabId)
            cleanupFunctionsRef.current[tabId]()
            delete cleanupFunctionsRef.current[tabId]
          }
        }
      } catch (error) {
        console.error('Error cleaning up webview:', error)
      }

      // 删除引用
      delete webviewRefs.current[tabId]
      console.log('Removed webview reference for tab:', tabId)
    }

    // 删除会话状态
    delete webviewSessionsRef.current[tabId]
    console.log('Removed session state for tab:', tabId)

    // 保存到本地存储 - 确保不包含已关闭的选项卡
    saveTabsToStorage(newTabs, newActiveTabId)

    console.log('Tab closed, remaining tabs:', newTabs.length)
  }

  const handleTabChange = (newActiveTabId: string) => {
    console.log('Switching to tab:', newActiveTabId)

    // 更新活动标签页ID
    setActiveTabId(newActiveTabId)

    // 更新URL和其他状态
    const newActiveTab = tabs.find((tab) => tab.id === newActiveTabId)
    if (newActiveTab) {
      // 获取新活动的webview
      const newWebview = webviewRefs.current[newActiveTabId]

      // 如果webview存在，从webview获取最新状态
      if (newWebview) {
        try {
          // 获取当前URL
          const currentURL = newWebview.getURL()
          if (currentURL && currentURL !== 'about:blank') {
            // 使用webview的实际URL，而不是存储的URL
            setUrl(currentURL)
            setCurrentUrl(currentURL)

            // 更新选项卡信息
            updateTabInfo(newActiveTabId, { url: currentURL })
          } else {
            // 如果没有有效URL，使用存储的URL
            setUrl(newActiveTab.url)
            setCurrentUrl(newActiveTab.url)
          }

          // 更新导航状态
          setCanGoBack(newWebview.canGoBack())
          setCanGoForward(newWebview.canGoForward())
          setIsLoading(newWebview.isLoading())
        } catch (error) {
          console.error('Error getting webview state:', error)

          // 出错时使用存储的状态
          setUrl(newActiveTab.url)
          setCurrentUrl(newActiveTab.url)
          setCanGoBack(newActiveTab.canGoBack)
          setCanGoForward(newActiveTab.canGoForward)
          setIsLoading(newActiveTab.isLoading)
        }
      } else {
        // 如果webview不存在，使用存储的状态
        setUrl(newActiveTab.url)
        setCurrentUrl(newActiveTab.url)
        setCanGoBack(newActiveTab.canGoBack)
        setCanGoForward(newActiveTab.canGoForward)
        setIsLoading(newActiveTab.isLoading)
      }

      // 保存到本地存储
      saveTabsToStorage(tabs, newActiveTabId)
    }
  }

  // 更新选项卡信息
  const updateTabInfo = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))

      // 保存到本地存储
      saveTabsToStorage(newTabs, activeTabId)

      return newTabs
    })
  }

  // 在组件挂载和卸载时处理webview会话
  useEffect(() => {
    // 组件挂载时，确保webviewSessionsRef与tabs同步
    tabs.forEach((tab) => {
      if (!webviewSessionsRef.current[tab.id]) {
        webviewSessionsRef.current[tab.id] = false
      }
    })

    // 组件卸载时保存状态
    return () => {
      saveTabsToStorage(tabs, activeTabId)
    }
  }, [tabs, activeTabId])

  // 检测Google登录页面
  useEffect(() => {
    // 检测是否是Google登录页面
    if (currentUrl.includes('accounts.google.com')) {
      setShowGoogleLoginTip(true)

      // 如果是Google登录页面，添加最小化的处理
      if (webviewRef.current) {
        const webview = webviewRef.current

        // 最小化的脚本，只设置必要的cookie
        webview.executeJavaScript(`
          // 设置必要的cookie
          document.cookie = "CONSENT=YES+; domain=.google.com; path=/; expires=" + new Date(Date.now() + 86400000).toUTCString();

          // 检查是否显示了错误消息
          if (document.body.textContent.includes('无法登录') || document.body.textContent.includes('不安全')) {
            // 如果有错误，尝试使用移动版登录页面
            console.log('检测到登录错误，将尝试使用移动版登录页面');
          }

          console.log('最小化的Google登录处理脚本已注入');
        `)
      }
    } else {
      setShowGoogleLoginTip(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, activeTabId])

  return (
    <BrowserContainer>
      <NavBar>
        <Space style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <Tooltip title={t('browser.back')}>
            <Button icon={<ArrowLeftOutlined />} disabled={!canGoBack} onClick={handleGoBack} />
          </Tooltip>
          <Tooltip title={t('browser.forward')}>
            <Button icon={<ArrowRightOutlined />} disabled={!canGoForward} onClick={handleGoForward} />
          </Tooltip>
          <Tooltip title={t('browser.refresh')}>
            <Button icon={<ReloadOutlined />} onClick={handleReload} loading={isLoading} />
          </Tooltip>
          <Tooltip title={t('browser.home')}>
            <Button icon={<HomeOutlined />} onClick={handleHome} />
          </Tooltip>
          <Tooltip title={t('browser.devtools')}>
            <Button icon={<BugOutlined />} onClick={handleOpenDevTools} />
          </Tooltip>
          <Tooltip title={t('browser.open_external')}>
            <Button icon={<ExportOutlined />} onClick={handleOpenExternal} />
          </Tooltip>
          <Tooltip title={t('browser.clear_data')}>
            <Button icon={<DeleteOutlined />} onClick={handleClearData} />
          </Tooltip>
        </Space>

        <AddressBar
          value={currentUrl}
          onChange={handleUrlChange}
          onPressEnter={handleUrlSubmit}
          prefix={<SearchOutlined />}
          placeholder={t('browser.url_placeholder')}
        />
      </NavBar>

      <TabsContainer>
        <Tabs
          type="card"
          activeKey={activeTabId}
          onChange={handleTabChange}
          tabBarExtraContent={{
            right: (
              <Button
                className="add-tab-button"
                icon={<PlusOutlined />}
                onClick={() => handleAddTab()}
                title={t('browser.new_tab')}
              />
            )
          }}
          items={tabs.map((tab) => ({
            key: tab.id,
            label: (
              <span>
                {tab.favicon && (
                  <img
                    src={tab.favicon}
                    alt=""
                    style={{ width: 16, height: 16, marginRight: 8, verticalAlign: 'middle' }}
                  />
                )}
                {tab.title || tab.url}
                <CloseOutlined onClick={(e) => handleCloseTab(tab.id, e)} />
              </span>
            )
          }))}
        />
      </TabsContainer>

      <WebviewContainer>
        {showGoogleLoginTip && (
          <GoogleLoginTip>
            <div className="tip-content">
              <p>{t('browser.google_login_tip') || '检测到Google登录页面，建议使用移动版登录页面以获得更好的体验。'}</p>
              <Space>
                <Button type="primary" onClick={handleGoogleLogin}>
                  使用移动版登录页面
                </Button>
                <Button icon={<DeleteOutlined />} onClick={handleClearData}>
                  清除数据并重试
                </Button>
              </Space>
            </div>
          </GoogleLoginTip>
        )}

        {/* 为每个选项卡创建一个webview */}
        {tabs.map((tab) => (
          <div key={tab.id} className={`webview-wrapper ${tab.id === activeTabId ? 'active' : ''}`}>
            <webview
              ref={(el: any) => {
                if (el) {
                  // 检查这个webview是否已经有引用
                  const existingWebview = webviewRefs.current[tab.id]

                  // 只有在webview不存在或者是新创建的选项卡时才设置引用和加载URL
                  if (!existingWebview) {
                    console.log('Creating new webview for tab:', tab.id, 'URL:', tab.url)

                    // 保存webview引用
                    webviewRefs.current[tab.id] = el as WebviewTag

                    // 标记为已初始化
                    webviewSessionsRef.current[tab.id] = true

                    // 设置初始URL
                    el.src = tab.url

                    // 设置事件监听器并保存清理函数
                    const cleanup = setupWebviewListeners(el as WebviewTag, tab.id)
                    cleanupFunctionsRef.current[tab.id] = cleanup
                  } else if (existingWebview !== el) {
                    // 如果引用变了（React重新创建了元素），保留原来的状态
                    console.log('Webview reference changed for tab:', tab.id, 'preserving state')

                    // 先清理旧的事件监听器
                    if (cleanupFunctionsRef.current[tab.id]) {
                      cleanupFunctionsRef.current[tab.id]()
                    }

                    // 更新webview引用
                    webviewRefs.current[tab.id] = el as WebviewTag

                    // 不要重新设置src，这会导致页面刷新
                    // 只有在URL明确改变时才设置src
                    if (existingWebview.getURL() !== tab.url && tab.url !== '') {
                      el.src = tab.url
                    }

                    // 重新设置事件监听器
                    const cleanup = setupWebviewListeners(el as WebviewTag, tab.id)
                    cleanupFunctionsRef.current[tab.id] = cleanup
                  }
                } else {
                  // DOM元素被移除，清理事件监听器
                  if (cleanupFunctionsRef.current[tab.id]) {
                    cleanupFunctionsRef.current[tab.id]()
                    delete cleanupFunctionsRef.current[tab.id]
                  }
                }
              }}
              allowpopups={true}
              partition="persist:browser"
              useragent={userAgent}
              preload=""
              webpreferences="contextIsolation=no, javascript=yes, webgl=yes, webaudio=yes, allowRunningInsecureContent=yes, nodeIntegration=yes, enableRemoteModule=yes"
              disablewebsecurity={DISABLE_SECURITY}
              plugins={true}
            />
          </div>
        ))}
      </WebviewContainer>
    </BrowserContainer>
  )
}

export default Browser
