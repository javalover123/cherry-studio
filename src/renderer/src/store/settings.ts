import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TRANSLATE_PROMPT } from '@renderer/config/prompts'
import { CodeStyleVarious, LanguageVarious, Model, ThemeMode, TranslateLanguageVarious } from '@renderer/types'
import { IpcChannel } from '@shared/IpcChannel'

import { WebDAVSyncState } from './backup'

export type SendMessageShortcut = 'Enter' | 'Shift+Enter' | 'Ctrl+Enter' | 'Command+Enter'

export type SidebarIcon =
  | 'assistants'
  | 'agents'
  | 'paintings'
  | 'translate'
  | 'minapp'
  | 'knowledge'
  | 'files'
  | 'projects'
  | 'workspace'
  | 'deepresearch'
  | 'browser'

export const DEFAULT_SIDEBAR_ICONS: SidebarIcon[] = [
  'assistants',
  'agents',
  'paintings',
  'translate',
  'minapp',
  'knowledge',
  'files',
  'workspace',
  'deepresearch',
  'browser'
]

export interface NutstoreSyncRuntime extends WebDAVSyncState {}

export type AssistantIconType = 'model' | 'emoji' | 'none'

export interface SettingsState {
  showAssistants: boolean
  showTopics: boolean
  sendMessageShortcut: SendMessageShortcut
  language: LanguageVarious
  targetLanguage: TranslateLanguageVarious
  proxyMode: 'system' | 'custom' | 'none'
  proxyUrl?: string
  userName: string
  showMessageDivider: boolean
  messageFont: 'system' | 'serif'
  showInputEstimatedTokens: boolean
  launchOnBoot: boolean
  launchToTray: boolean
  trayOnClose: boolean
  tray: boolean
  theme: ThemeMode
  windowStyle: 'transparent' | 'opaque'
  fontSize: number
  topicPosition: 'left' | 'right'
  showTopicTime: boolean
  assistantIconType: AssistantIconType
  pasteLongTextAsFile: boolean
  pasteLongTextThreshold: number
  clickAssistantToShowTopic: boolean
  autoCheckUpdate: boolean
  renderInputMessageAsMarkdown: boolean
  enableHistoricalContext: boolean // 是否启用历史对话上下文功能
  usePromptForToolCalling: boolean // 是否使用提示词而非函数调用来调用MCP工具
  enableAgentMode: boolean // 是否启用Agent模式
  agentModeMaxApiRequests: number // Agent模式下最大API请求次数
  showAgentTaskList: boolean // 是否显示Agent任务列表
  agentAutoExecutionCount: number // Agent自动执行次数
  codeShowLineNumbers: boolean
  codeCollapsible: boolean
  codeWrappable: boolean
  // 代码块缓存
  codeCacheable: boolean
  codeCacheMaxSize: number
  codeCacheTTL: number
  codeCacheThreshold: number
  mathEngine: 'MathJax' | 'KaTeX'
  messageStyle: 'plain' | 'bubble'
  codeStyle: CodeStyleVarious
  foldDisplayMode: 'expanded' | 'compact'
  gridColumns: number
  gridPopoverTrigger: 'hover' | 'click'
  messageNavigation: 'none' | 'buttons' | 'anchor'
  // PDF设置
  pdfSettings: {
    enablePdfSplitting: boolean // 是否启用PDF分割功能
    defaultPageRangePrompt: string // 默认页码范围提示文本
  }
  // webdav 配置 host, user, pass, path
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
  webdavAutoSync: boolean
  webdavSyncInterval: number
  translateModelPrompt: string
  autoTranslateWithSpace: boolean
  enableTopicNaming: boolean
  customCss: string
  topicNamingPrompt: string
  // Sidebar icons
  sidebarIcons: {
    visible: SidebarIcon[]
    disabled: SidebarIcon[]
  }
  narrowMode: boolean
  // QuickAssistant
  enableQuickAssistant: boolean
  clickTrayToShowQuickAssistant: boolean
  multiModelMessageStyle: MultiModelMessageStyle
  readClipboardAtStartup: boolean
  notionDatabaseID: string | null
  notionApiKey: string | null
  notionPageNameKey: string | null
  markdownExportPath: string | null
  forceDollarMathInMarkdown: boolean
  useTopicNamingForMessageTitle: boolean
  thoughtAutoCollapse: boolean
  notionAutoSplit: boolean
  notionSplitSize: number
  yuqueToken: string | null
  yuqueUrl: string | null
  yuqueRepoId: string | null
  joplinToken: string | null
  joplinUrl: string | null
  defaultObsidianVault: string | null
  // 思源笔记配置
  siyuanApiUrl: string | null
  siyuanToken: string | null
  siyuanBoxId: string | null
  siyuanRootPath: string | null
  maxKeepAliveMinapps: number
  showOpenedMinappsInSidebar: boolean
  // 隐私设置
  enableDataCollection: boolean
  // TTS配置
  ttsEnabled: boolean
  ttsServiceType: string // TTS服务类型：openai、edge、siliconflow或mstts
  ttsApiKey: string
  ttsApiUrl: string
  ttsVoice: string
  ttsModel: string
  ttsCustomVoices: string[]
  ttsCustomModels: string[]
  showTTSProgressBar: boolean // 是否显示TTS进度条
  autoPlayTTSOutsideVoiceCall: boolean // 是否在语音通话模式之外自动播放TTS
  // 浏览器 TTS配置
  ttsEdgeVoice: string
  // 硅基流动 TTS配置
  ttsSiliconflowApiKey: string
  ttsSiliconflowApiUrl: string
  ttsSiliconflowVoice: string
  ttsSiliconflowModel: string
  ttsSiliconflowResponseFormat: string
  ttsSiliconflowSpeed: number
  // 免费在线 TTS配置
  ttsMsVoice: string
  ttsMsOutputFormat: string
  // TTS过滤选项
  ttsFilterOptions: {
    filterThinkingProcess: boolean // 过滤思考过程
    filterMarkdown: boolean // 过滤Markdown标记
    filterCodeBlocks: boolean // 过滤代码块
    filterHtmlTags: boolean // 过滤HTML标签
    filterEmojis: boolean // 过滤表情符号
    maxTextLength: number // 最大文本长度
  }
  // ASR配置（语音识别）
  asrEnabled: boolean
  asrServiceType: string // ASR服务类型：openai或browser
  asrApiKey: string
  asrApiUrl: string
  asrModel: string
  asrAutoStartServer: boolean // 启动应用时自动启动ASR服务器
  asrLanguage: string // 语音识别语言
  // 语音通话配置
  voiceCallEnabled: boolean
  voiceCallModel: Model | null
  voiceCallPrompt: string | null // 语音通话自定义提示词
  isVoiceCallActive: boolean // 语音通话窗口是否激活
  lastPlayedMessageId: string | null // 最后一次播放的消息ID
  skipNextAutoTTS: boolean // 是否跳过下一次自动TTS
  // Quick Panel Triggers
  enableQuickPanelTriggers: boolean
  enableBackspaceDeleteModel: boolean
  // Export Menu Options
  exportMenuOptions: {
    image: boolean
    markdown: boolean
    markdown_reason: boolean
    notion: boolean
    yuque: boolean
    joplin: boolean
    obsidian: boolean
    siyuan: boolean
    docx: boolean
  }
  // DeepResearch 设置
  enableDeepResearch: boolean
  deepResearchShortcut: string
  deepResearchMaxDepth: number
  deepResearchMaxUrls: number
  deepResearchTimeLimit: number
}

export type MultiModelMessageStyle = 'horizontal' | 'vertical' | 'fold' | 'grid'

export const initialState: SettingsState = {
  showAssistants: true,
  showTopics: true,
  sendMessageShortcut: 'Enter',
  language: navigator.language as LanguageVarious,
  targetLanguage: 'english' as TranslateLanguageVarious,
  proxyMode: 'system',
  proxyUrl: undefined,
  userName: '',
  showMessageDivider: true,
  messageFont: 'system',
  showInputEstimatedTokens: false,
  launchOnBoot: false,
  launchToTray: false,
  trayOnClose: true,
  tray: true,
  theme: ThemeMode.auto,
  windowStyle: 'transparent',
  fontSize: 14,
  topicPosition: 'left',
  showTopicTime: false,
  assistantIconType: 'emoji',
  pasteLongTextAsFile: false,
  pasteLongTextThreshold: 1500,
  clickAssistantToShowTopic: true,
  autoCheckUpdate: true,
  renderInputMessageAsMarkdown: false,
  enableHistoricalContext: false, // 默认禁用历史对话上下文功能
  usePromptForToolCalling: true, // 默认使用提示词而非函数调用来调用MCP工具
  enableAgentMode: false, // 默认禁用Agent模式
  agentModeMaxApiRequests: 20, // 默认最大API请求次数为20
  showAgentTaskList: true, // 默认显示Agent任务列表
  agentAutoExecutionCount: 5, // 默认Agent自动执行次数为5
  codeShowLineNumbers: false,
  codeCollapsible: false,
  codeWrappable: false,
  codeCacheable: false,
  codeCacheMaxSize: 1000, // 缓存最大容量，千字符数
  codeCacheTTL: 15, // 缓存过期时间，分钟
  codeCacheThreshold: 2, // 允许缓存的最小代码长度，千字符数
  mathEngine: 'KaTeX',
  messageStyle: 'plain',
  codeStyle: 'auto',
  foldDisplayMode: 'expanded',
  gridColumns: 2,
  gridPopoverTrigger: 'click',
  messageNavigation: 'none',
  // PDF设置
  pdfSettings: {
    enablePdfSplitting: true, // 默认启用PDF分割功能
    defaultPageRangePrompt: '输入页码范围，例如：1-5,8,10-15' // 默认页码范围提示文本
  },
  webdavHost: '',
  webdavUser: '',
  webdavPass: '',
  webdavPath: '/cherry-studio',
  webdavAutoSync: false,
  webdavSyncInterval: 0,
  translateModelPrompt: TRANSLATE_PROMPT,
  autoTranslateWithSpace: false,
  enableTopicNaming: true,
  customCss: '',
  topicNamingPrompt: '',
  sidebarIcons: {
    visible: DEFAULT_SIDEBAR_ICONS,
    disabled: []
  },
  narrowMode: false,
  enableQuickAssistant: false,
  clickTrayToShowQuickAssistant: false,
  readClipboardAtStartup: true,
  multiModelMessageStyle: 'fold',
  notionDatabaseID: '',
  notionApiKey: '',
  notionPageNameKey: 'Name',
  markdownExportPath: null,
  forceDollarMathInMarkdown: false,
  useTopicNamingForMessageTitle: false,
  thoughtAutoCollapse: true,
  notionAutoSplit: false,
  notionSplitSize: 90,
  yuqueToken: '',
  yuqueUrl: '',
  yuqueRepoId: '',
  joplinToken: '',
  joplinUrl: '',
  defaultObsidianVault: null,
  siyuanApiUrl: null,
  siyuanToken: null,
  siyuanBoxId: null,
  siyuanRootPath: null,
  maxKeepAliveMinapps: 3,
  showOpenedMinappsInSidebar: true,
  enableDataCollection: false,
  // TTS配置
  ttsEnabled: false,
  ttsServiceType: 'openai', // 默认使用 OpenAI TTS
  ttsApiKey: '',
  autoPlayTTSOutsideVoiceCall: false, // 默认不在语音通话模式之外自动播放TTS
  ttsApiUrl: 'https://api.openai.com/v1/audio/speech',
  ttsVoice: '',
  ttsModel: '',
  ttsCustomVoices: [],
  ttsCustomModels: [],
  showTTSProgressBar: true, // 默认显示TTS进度条
  // Edge TTS配置
  ttsEdgeVoice: 'zh-CN-XiaoxiaoNeural', // 默认使用小小的声音
  // 硅基流动 TTS配置
  ttsSiliconflowApiKey: '',
  ttsSiliconflowApiUrl: 'https://api.siliconflow.cn/v1/audio/speech',
  ttsSiliconflowVoice: 'FunAudioLLM/CosyVoice2-0.5B:alex',
  ttsSiliconflowModel: 'FunAudioLLM/CosyVoice2-0.5B',
  ttsSiliconflowResponseFormat: 'mp3',
  ttsSiliconflowSpeed: 1.0,
  // 免费在线 TTS配置
  ttsMsVoice: 'zh-CN-XiaoxiaoNeural',
  ttsMsOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  ttsFilterOptions: {
    filterThinkingProcess: true, // 默认过滤思考过程
    filterMarkdown: true, // 默认过滤Markdown标记
    filterCodeBlocks: true, // 默认过滤代码块
    filterHtmlTags: true, // 默认过滤HTML标签
    filterEmojis: true, // 默认过滤表情符号
    maxTextLength: 4000 // 默认最大文本长度
  },
  // ASR配置（语音识别）
  asrEnabled: false,
  asrServiceType: 'openai', // 默认使用 OpenAI ASR
  asrApiKey: '',
  asrApiUrl: 'https://api.openai.com/v1/audio/transcriptions',
  asrModel: 'whisper-1',
  asrAutoStartServer: false, // 默认不自动启动ASR服务器
  asrLanguage: 'zh-CN', // 默认使用中文
  // 语音通话配置
  voiceCallEnabled: true,
  voiceCallModel: null,
  voiceCallPrompt: null, // 默认为null，表示使用默认提示词
  isVoiceCallActive: false, // 语音通话窗口是否激活
  lastPlayedMessageId: null, // 最后一次播放的消息ID
  skipNextAutoTTS: false, // 是否跳过下一次自动TTS
  enableQuickPanelTriggers: false, // Quick Panel Triggers
  enableBackspaceDeleteModel: true,
  // Export Menu Options
  exportMenuOptions: {
    image: true,
    markdown: true,
    markdown_reason: true,
    notion: true,
    yuque: true,
    joplin: true,
    obsidian: true,
    siyuan: true,
    docx: true
  },
  // DeepResearch 设置
  enableDeepResearch: true,
  deepResearchShortcut: 'Alt+D',
  deepResearchMaxDepth: 3,
  deepResearchMaxUrls: 30,
  deepResearchTimeLimit: 120
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setEnableAgentMode: (state, action: PayloadAction<boolean>) => {
      state.enableAgentMode = action.payload
    },
    setAgentModeMaxApiRequests: (state, action: PayloadAction<number>) => {
      state.agentModeMaxApiRequests = action.payload
    },
    setShowAgentTaskList: (state, action: PayloadAction<boolean>) => {
      state.showAgentTaskList = action.payload
    },
    setAgentAutoExecutionCount: (state, action: PayloadAction<number>) => {
      state.agentAutoExecutionCount = action.payload
    },
    setUsePromptForToolCalling: (state, action: PayloadAction<boolean>) => {
      state.usePromptForToolCalling = action.payload
    },
    setShowAssistants: (state, action: PayloadAction<boolean>) => {
      state.showAssistants = action.payload
    },
    toggleShowAssistants: (state) => {
      state.showAssistants = !state.showAssistants
    },
    setShowTopics: (state, action: PayloadAction<boolean>) => {
      state.showTopics = action.payload
    },
    toggleShowTopics: (state) => {
      state.showTopics = !state.showTopics
    },
    setSendMessageShortcut: (state, action: PayloadAction<SendMessageShortcut>) => {
      state.sendMessageShortcut = action.payload
    },
    setLanguage: (state, action: PayloadAction<LanguageVarious>) => {
      state.language = action.payload
      window.electron.ipcRenderer.send(IpcChannel.MiniWindowReload)
    },
    setTargetLanguage: (state, action: PayloadAction<TranslateLanguageVarious>) => {
      state.targetLanguage = action.payload
    },
    setProxyMode: (state, action: PayloadAction<'system' | 'custom' | 'none'>) => {
      state.proxyMode = action.payload
    },
    setProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      state.proxyUrl = action.payload
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setShowMessageDivider: (state, action: PayloadAction<boolean>) => {
      state.showMessageDivider = action.payload
    },
    setMessageFont: (state, action: PayloadAction<'system' | 'serif'>) => {
      state.messageFont = action.payload
    },
    setShowInputEstimatedTokens: (state, action: PayloadAction<boolean>) => {
      state.showInputEstimatedTokens = action.payload
    },
    setLaunchOnBoot: (state, action: PayloadAction<boolean>) => {
      state.launchOnBoot = action.payload
    },
    setLaunchToTray: (state, action: PayloadAction<boolean>) => {
      state.launchToTray = action.payload
    },
    setTray: (state, action: PayloadAction<boolean>) => {
      state.tray = action.payload
    },
    setTrayOnClose: (state, action: PayloadAction<boolean>) => {
      state.trayOnClose = action.payload
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload
    },
    setWindowStyle: (state, action: PayloadAction<'transparent' | 'opaque'>) => {
      state.windowStyle = action.payload
    },
    setTopicPosition: (state, action: PayloadAction<'left' | 'right'>) => {
      state.topicPosition = action.payload
    },
    setShowTopicTime: (state, action: PayloadAction<boolean>) => {
      state.showTopicTime = action.payload
    },
    setAssistantIconType: (state, action: PayloadAction<AssistantIconType>) => {
      state.assistantIconType = action.payload
    },
    setPasteLongTextAsFile: (state, action: PayloadAction<boolean>) => {
      state.pasteLongTextAsFile = action.payload
    },
    setAutoCheckUpdate: (state, action: PayloadAction<boolean>) => {
      state.autoCheckUpdate = action.payload
    },
    setRenderInputMessageAsMarkdown: (state, action: PayloadAction<boolean>) => {
      state.renderInputMessageAsMarkdown = action.payload
    },

    setEnableHistoricalContext: (state, action: PayloadAction<boolean>) => {
      state.enableHistoricalContext = action.payload
    },
    setClickAssistantToShowTopic: (state, action: PayloadAction<boolean>) => {
      state.clickAssistantToShowTopic = action.payload
    },
    setWebdavHost: (state, action: PayloadAction<string>) => {
      state.webdavHost = action.payload
    },
    setWebdavUser: (state, action: PayloadAction<string>) => {
      state.webdavUser = action.payload
    },
    setWebdavPass: (state, action: PayloadAction<string>) => {
      state.webdavPass = action.payload
    },
    setWebdavPath: (state, action: PayloadAction<string>) => {
      state.webdavPath = action.payload
    },
    setWebdavAutoSync: (state, action: PayloadAction<boolean>) => {
      state.webdavAutoSync = action.payload
    },
    setWebdavSyncInterval: (state, action: PayloadAction<number>) => {
      state.webdavSyncInterval = action.payload
    },
    setCodeShowLineNumbers: (state, action: PayloadAction<boolean>) => {
      state.codeShowLineNumbers = action.payload
    },
    setCodeCollapsible: (state, action: PayloadAction<boolean>) => {
      state.codeCollapsible = action.payload
    },
    setCodeWrappable: (state, action: PayloadAction<boolean>) => {
      state.codeWrappable = action.payload
    },
    setCodeCacheable: (state, action: PayloadAction<boolean>) => {
      state.codeCacheable = action.payload
    },
    setCodeCacheMaxSize: (state, action: PayloadAction<number>) => {
      state.codeCacheMaxSize = action.payload
    },
    setCodeCacheTTL: (state, action: PayloadAction<number>) => {
      state.codeCacheTTL = action.payload
    },
    setCodeCacheThreshold: (state, action: PayloadAction<number>) => {
      state.codeCacheThreshold = action.payload
    },
    setMathEngine: (state, action: PayloadAction<'MathJax' | 'KaTeX'>) => {
      state.mathEngine = action.payload
    },
    setFoldDisplayMode: (state, action: PayloadAction<'expanded' | 'compact'>) => {
      state.foldDisplayMode = action.payload
    },
    setGridColumns: (state, action: PayloadAction<number>) => {
      state.gridColumns = action.payload
    },
    setGridPopoverTrigger: (state, action: PayloadAction<'hover' | 'click'>) => {
      state.gridPopoverTrigger = action.payload
    },
    setMessageStyle: (state, action: PayloadAction<'plain' | 'bubble'>) => {
      state.messageStyle = action.payload
    },
    setCodeStyle: (state, action: PayloadAction<CodeStyleVarious>) => {
      state.codeStyle = action.payload
    },
    setTranslateModelPrompt: (state, action: PayloadAction<string>) => {
      state.translateModelPrompt = action.payload
    },
    setAutoTranslateWithSpace: (state, action: PayloadAction<boolean>) => {
      state.autoTranslateWithSpace = action.payload
    },
    setEnableTopicNaming: (state, action: PayloadAction<boolean>) => {
      state.enableTopicNaming = action.payload
    },
    setPasteLongTextThreshold: (state, action: PayloadAction<number>) => {
      state.pasteLongTextThreshold = action.payload
    },
    setCustomCss: (state, action: PayloadAction<string>) => {
      state.customCss = action.payload
    },
    setTopicNamingPrompt: (state, action: PayloadAction<string>) => {
      state.topicNamingPrompt = action.payload
    },
    setSidebarIcons: (state, action: PayloadAction<{ visible?: SidebarIcon[]; disabled?: SidebarIcon[] }>) => {
      if (action.payload.visible) {
        state.sidebarIcons.visible = action.payload.visible
      }
      if (action.payload.disabled) {
        state.sidebarIcons.disabled = action.payload.disabled
      }
    },
    setNarrowMode: (state, action: PayloadAction<boolean>) => {
      state.narrowMode = action.payload
    },
    setClickTrayToShowQuickAssistant: (state, action: PayloadAction<boolean>) => {
      state.clickTrayToShowQuickAssistant = action.payload
    },
    setEnableQuickAssistant: (state, action: PayloadAction<boolean>) => {
      state.enableQuickAssistant = action.payload
    },
    setReadClipboardAtStartup: (state, action: PayloadAction<boolean>) => {
      state.readClipboardAtStartup = action.payload
    },
    setMultiModelMessageStyle: (state, action: PayloadAction<'horizontal' | 'vertical' | 'fold' | 'grid'>) => {
      state.multiModelMessageStyle = action.payload
    },
    setNotionDatabaseID: (state, action: PayloadAction<string>) => {
      state.notionDatabaseID = action.payload
    },
    setNotionApiKey: (state, action: PayloadAction<string>) => {
      state.notionApiKey = action.payload
    },
    setNotionPageNameKey: (state, action: PayloadAction<string>) => {
      state.notionPageNameKey = action.payload
    },
    setmarkdownExportPath: (state, action: PayloadAction<string | null>) => {
      state.markdownExportPath = action.payload
    },
    setForceDollarMathInMarkdown: (state, action: PayloadAction<boolean>) => {
      state.forceDollarMathInMarkdown = action.payload
    },
    setUseTopicNamingForMessageTitle: (state, action: PayloadAction<boolean>) => {
      state.useTopicNamingForMessageTitle = action.payload
    },
    setThoughtAutoCollapse: (state, action: PayloadAction<boolean>) => {
      state.thoughtAutoCollapse = action.payload
    },
    setNotionAutoSplit: (state, action: PayloadAction<boolean>) => {
      state.notionAutoSplit = action.payload
    },
    setNotionSplitSize: (state, action: PayloadAction<number>) => {
      state.notionSplitSize = action.payload
    },
    setYuqueToken: (state, action: PayloadAction<string>) => {
      state.yuqueToken = action.payload
    },
    setYuqueRepoId: (state, action: PayloadAction<string>) => {
      state.yuqueRepoId = action.payload
    },
    setYuqueUrl: (state, action: PayloadAction<string>) => {
      state.yuqueUrl = action.payload
    },
    setJoplinToken: (state, action: PayloadAction<string>) => {
      state.joplinToken = action.payload
    },
    setJoplinUrl: (state, action: PayloadAction<string>) => {
      state.joplinUrl = action.payload
    },
    setSiyuanApiUrl: (state, action: PayloadAction<string>) => {
      state.siyuanApiUrl = action.payload
    },
    setSiyuanToken: (state, action: PayloadAction<string>) => {
      state.siyuanToken = action.payload
    },
    setSiyuanBoxId: (state, action: PayloadAction<string>) => {
      state.siyuanBoxId = action.payload
    },
    setSiyuanRootPath: (state, action: PayloadAction<string>) => {
      state.siyuanRootPath = action.payload
    },
    setMessageNavigation: (state, action: PayloadAction<'none' | 'buttons' | 'anchor'>) => {
      state.messageNavigation = action.payload
    },
    setDefaultObsidianVault: (state, action: PayloadAction<string>) => {
      state.defaultObsidianVault = action.payload
    },
    setMaxKeepAliveMinapps: (state, action: PayloadAction<number>) => {
      state.maxKeepAliveMinapps = action.payload
    },
    setShowOpenedMinappsInSidebar: (state, action: PayloadAction<boolean>) => {
      state.showOpenedMinappsInSidebar = action.payload
    },
    setEnableDataCollection: (state, action: PayloadAction<boolean>) => {
      state.enableDataCollection = action.payload
    },
    // TTS相关的action
    setTtsEnabled: (state, action: PayloadAction<boolean>) => {
      state.ttsEnabled = action.payload
    },
    setTtsServiceType: (state, action: PayloadAction<string>) => {
      state.ttsServiceType = action.payload
    },
    setTtsApiKey: (state, action: PayloadAction<string>) => {
      state.ttsApiKey = action.payload
    },
    setTtsApiUrl: (state, action: PayloadAction<string>) => {
      state.ttsApiUrl = action.payload
    },
    setTtsEdgeVoice: (state, action: PayloadAction<string>) => {
      state.ttsEdgeVoice = action.payload
    },
    // 硅基流动TTS相关的action
    setTtsSiliconflowApiKey: (state, action: PayloadAction<string>) => {
      state.ttsSiliconflowApiKey = action.payload
    },
    setTtsSiliconflowApiUrl: (state, action: PayloadAction<string>) => {
      state.ttsSiliconflowApiUrl = action.payload
    },
    setTtsSiliconflowVoice: (state, action: PayloadAction<string>) => {
      state.ttsSiliconflowVoice = action.payload
    },
    setTtsSiliconflowModel: (state, action: PayloadAction<string>) => {
      state.ttsSiliconflowModel = action.payload
    },
    setTtsSiliconflowResponseFormat: (state, action: PayloadAction<string>) => {
      state.ttsSiliconflowResponseFormat = action.payload
    },
    setTtsSiliconflowSpeed: (state, action: PayloadAction<number>) => {
      state.ttsSiliconflowSpeed = action.payload
    },
    // 免费在线TTS相关的action
    setTtsMsVoice: (state, action: PayloadAction<string>) => {
      state.ttsMsVoice = action.payload
    },
    setTtsMsOutputFormat: (state, action: PayloadAction<string>) => {
      state.ttsMsOutputFormat = action.payload
    },
    setTtsVoice: (state, action: PayloadAction<string>) => {
      state.ttsVoice = action.payload
    },
    setTtsModel: (state, action: PayloadAction<string>) => {
      state.ttsModel = action.payload
    },
    setTtsCustomVoices: (state, action: PayloadAction<string[]>) => {
      // 确保所有值都是字符串
      state.ttsCustomVoices = action.payload
        .filter((voice) => voice !== null && voice !== undefined)
        .map((voice) => (typeof voice === 'string' ? voice : String(voice)))
    },
    setTtsCustomModels: (state, action: PayloadAction<string[]>) => {
      // 确保所有值都是字符串
      state.ttsCustomModels = action.payload
        .filter((model) => model !== null && model !== undefined)
        .map((model) => (typeof model === 'string' ? model : String(model)))
    },
    resetTtsCustomValues: (state) => {
      // 重置所有自定义音色和模型
      state.ttsCustomVoices = []
      state.ttsCustomModels = []
    },
    addTtsCustomVoice: (state, action: PayloadAction<string>) => {
      // 确保添加的是字符串
      const voiceStr = typeof action.payload === 'string' ? action.payload : String(action.payload)

      // 检查是否已存在相同的音色
      const exists = state.ttsCustomVoices.some((voice) => {
        if (typeof voice === 'string') {
          return voice === voiceStr
        }
        return String(voice) === voiceStr
      })

      if (!exists) {
        state.ttsCustomVoices.push(voiceStr)
      }
    },
    addTtsCustomModel: (state, action: PayloadAction<string>) => {
      // 确保添加的是字符串
      const modelStr = typeof action.payload === 'string' ? action.payload : String(action.payload)

      // 检查是否已存在相同的模型
      const exists = state.ttsCustomModels.some((model) => {
        if (typeof model === 'string') {
          return model === modelStr
        }
        return String(model) === modelStr
      })

      if (!exists) {
        state.ttsCustomModels.push(modelStr)
      }
    },
    removeTtsCustomVoice: (state, action: PayloadAction<string>) => {
      // 确保删除的是字符串
      const voiceStr = typeof action.payload === 'string' ? action.payload : String(action.payload)

      // 过滤掉要删除的音色
      state.ttsCustomVoices = state.ttsCustomVoices.filter((voice) => {
        if (typeof voice === 'string') {
          return voice !== voiceStr
        }
        return String(voice) !== voiceStr
      })
    },
    removeTtsCustomModel: (state, action: PayloadAction<string>) => {
      // 确保删除的是字符串
      const modelStr = typeof action.payload === 'string' ? action.payload : String(action.payload)

      // 过滤掉要删除的模型
      state.ttsCustomModels = state.ttsCustomModels.filter((model) => {
        if (typeof model === 'string') {
          return model !== modelStr
        }
        return String(model) !== modelStr
      })
    },
    // TTS过滤选项的action
    setTtsFilterOptions: (
      state,
      action: PayloadAction<{
        filterThinkingProcess?: boolean
        filterMarkdown?: boolean
        filterCodeBlocks?: boolean
        filterHtmlTags?: boolean
        filterEmojis?: boolean
        maxTextLength?: number
      }>
    ) => {
      state.ttsFilterOptions = {
        ...state.ttsFilterOptions,
        ...action.payload
      }
    },
    // 设置是否显示TTS进度条
    setShowTTSProgressBar: (state, action: PayloadAction<boolean>) => {
      state.showTTSProgressBar = action.payload
    },
    setAutoPlayTTSOutsideVoiceCall: (state, action: PayloadAction<boolean>) => {
      state.autoPlayTTSOutsideVoiceCall = action.payload
    },
    // ASR相关的action
    setAsrEnabled: (state, action: PayloadAction<boolean>) => {
      state.asrEnabled = action.payload
    },
    setAsrServiceType: (state, action: PayloadAction<string>) => {
      state.asrServiceType = action.payload
    },
    setAsrApiKey: (state, action: PayloadAction<string>) => {
      state.asrApiKey = action.payload
    },
    setAsrApiUrl: (state, action: PayloadAction<string>) => {
      state.asrApiUrl = action.payload
    },
    setAsrModel: (state, action: PayloadAction<string>) => {
      state.asrModel = action.payload
    },
    setAsrAutoStartServer: (state, action: PayloadAction<boolean>) => {
      state.asrAutoStartServer = action.payload
    },
    setAsrLanguage: (state, action: PayloadAction<string>) => {
      state.asrLanguage = action.payload
    },
    setVoiceCallEnabled: (state, action: PayloadAction<boolean>) => {
      state.voiceCallEnabled = action.payload
    },
    setVoiceCallModel: (state, action: PayloadAction<Model | null>) => {
      state.voiceCallModel = action.payload
    },
    setVoiceCallPrompt: (state, action: PayloadAction<string | null>) => {
      state.voiceCallPrompt = action.payload
    },
    setIsVoiceCallActive: (state, action: PayloadAction<boolean>) => {
      state.isVoiceCallActive = action.payload
    },
    setLastPlayedMessageId: (state, action: PayloadAction<string | null>) => {
      state.lastPlayedMessageId = action.payload
    },
    setSkipNextAutoTTS: (state, action: PayloadAction<boolean>) => {
      state.skipNextAutoTTS = action.payload
    },
    // Quick Panel Triggers action
    setEnableQuickPanelTriggers: (state, action: PayloadAction<boolean>) => {
      state.enableQuickPanelTriggers = action.payload
    },
    setExportMenuOptions: (state, action: PayloadAction<typeof initialState.exportMenuOptions>) => {
      state.exportMenuOptions = action.payload
    },
    setEnableBackspaceDeleteModel: (state, action: PayloadAction<boolean>) => {
      state.enableBackspaceDeleteModel = action.payload
    },
    // DeepResearch 设置
    setEnableDeepResearch: (state, action: PayloadAction<boolean>) => {
      state.enableDeepResearch = action.payload
    },
    setDeepResearchShortcut: (state, action: PayloadAction<string>) => {
      state.deepResearchShortcut = action.payload
    },
    setDeepResearchMaxDepth: (state, action: PayloadAction<number>) => {
      state.deepResearchMaxDepth = action.payload
    },
    setDeepResearchMaxUrls: (state, action: PayloadAction<number>) => {
      state.deepResearchMaxUrls = action.payload
    },
    setDeepResearchTimeLimit: (state, action: PayloadAction<number>) => {
      state.deepResearchTimeLimit = action.payload
    },
    // PDF设置相关的action
    setPdfSettings: (
      state,
      action: PayloadAction<{
        enablePdfSplitting?: boolean
        defaultPageRangePrompt?: string
      }>
    ) => {
      state.pdfSettings = {
        ...state.pdfSettings,
        ...action.payload
      }
    }
  }
})

export const {
  setEnableAgentMode,
  setAgentModeMaxApiRequests,
  setShowAgentTaskList,
  setAgentAutoExecutionCount,
  setShowAssistants,
  toggleShowAssistants,
  setShowTopics,
  toggleShowTopics,
  setSendMessageShortcut,
  setLanguage,
  setTargetLanguage,
  setProxyMode,
  setProxyUrl,
  setUserName,
  setShowMessageDivider,
  setMessageFont,
  setShowInputEstimatedTokens,
  setLaunchOnBoot,
  setLaunchToTray,
  setTrayOnClose,
  setTray,
  setTheme,
  setFontSize,
  setWindowStyle,
  setTopicPosition,
  setShowTopicTime,
  setAssistantIconType,
  setPasteLongTextAsFile,
  setAutoCheckUpdate,
  setRenderInputMessageAsMarkdown,
  setEnableHistoricalContext,
  setClickAssistantToShowTopic,
  setWebdavHost,
  setWebdavUser,
  setWebdavPass,
  setWebdavPath,
  setWebdavAutoSync,
  setWebdavSyncInterval,
  setCodeShowLineNumbers,
  setCodeCollapsible,
  setCodeWrappable,
  setCodeCacheable,
  setCodeCacheMaxSize,
  setCodeCacheTTL,
  setCodeCacheThreshold,
  setMathEngine,
  setFoldDisplayMode,
  setGridColumns,
  setGridPopoverTrigger,
  setMessageStyle,
  setCodeStyle,
  setTranslateModelPrompt,
  setAutoTranslateWithSpace,
  setEnableTopicNaming,
  setPasteLongTextThreshold,
  setCustomCss,
  setTopicNamingPrompt,
  setSidebarIcons,
  setNarrowMode,
  setClickTrayToShowQuickAssistant,
  setEnableQuickAssistant,
  setReadClipboardAtStartup,
  setMultiModelMessageStyle,
  setNotionDatabaseID,
  setNotionApiKey,
  setNotionPageNameKey,
  setmarkdownExportPath,
  setForceDollarMathInMarkdown,
  setUseTopicNamingForMessageTitle,
  setThoughtAutoCollapse,
  setNotionAutoSplit,
  setNotionSplitSize,
  setYuqueToken,
  setYuqueRepoId,
  setYuqueUrl,
  setJoplinToken,
  setJoplinUrl,
  setMessageNavigation,
  setDefaultObsidianVault,
  setSiyuanApiUrl,
  setSiyuanToken,
  setSiyuanBoxId,
  setSiyuanRootPath,
  setMaxKeepAliveMinapps,
  setShowOpenedMinappsInSidebar,
  setEnableDataCollection,
  setEnableQuickPanelTriggers,
  setExportMenuOptions,
  setTtsEnabled,
  setTtsServiceType,
  setTtsApiKey,
  setTtsApiUrl,
  setTtsEdgeVoice,
  setTtsSiliconflowApiKey,
  setTtsSiliconflowApiUrl,
  setTtsSiliconflowVoice,
  setTtsSiliconflowModel,
  setTtsSiliconflowResponseFormat,
  setTtsSiliconflowSpeed,
  setTtsMsVoice,
  setTtsMsOutputFormat,
  setTtsVoice,
  setTtsModel,
  setTtsCustomVoices,
  setTtsCustomModels,
  resetTtsCustomValues,
  addTtsCustomVoice,
  addTtsCustomModel,
  removeTtsCustomVoice,
  removeTtsCustomModel,
  setTtsFilterOptions,
  setShowTTSProgressBar,
  setAutoPlayTTSOutsideVoiceCall,
  setAsrEnabled,
  setAsrServiceType,
  setAsrApiKey,
  setAsrApiUrl,
  setAsrModel,
  setAsrAutoStartServer,
  setAsrLanguage,
  setVoiceCallEnabled,
  setVoiceCallModel,
  setVoiceCallPrompt,
  setIsVoiceCallActive,
  setLastPlayedMessageId,
  setSkipNextAutoTTS,
  setEnableBackspaceDeleteModel,
  setUsePromptForToolCalling,
  // DeepResearch 设置
  setEnableDeepResearch,
  setDeepResearchShortcut,
  setDeepResearchMaxDepth,
  setDeepResearchMaxUrls,
  setDeepResearchTimeLimit
} = settingsSlice.actions

// PDF设置相关的action
export const setPdfSettings = settingsSlice.actions.setPdfSettings

export default settingsSlice.reducer
