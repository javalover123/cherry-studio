import { TextSegmenter } from '@renderer/services/tts/TextSegmenter'
import TTSService from '@renderer/services/TTSService'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

interface TTSHighlightedTextProps {
  text: string
}

interface SegmentedPlaybackState {
  isSegmentedPlayback: boolean
  segments: {
    text: string
    isLoaded: boolean
    isLoading: boolean
  }[]
  currentSegmentIndex: number
  isPlaying: boolean
}

const TTSHighlightedText: React.FC<TTSHighlightedTextProps> = ({ text }) => {
  const [segments, setSegments] = useState<string[]>([])
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1)
  // 播放状态变量，用于跟踪当前是否正在播放
  const [, setIsPlaying] = useState<boolean>(false)

  // 初始化时分割文本
  useEffect(() => {
    const textSegments = TextSegmenter.splitIntoSentences(text)
    setSegments(textSegments)
  }, [text])

  // 监听分段播放状态变化
  useEffect(() => {
    const handleSegmentedPlaybackUpdate = (event: CustomEvent) => {
      const data = event.detail as SegmentedPlaybackState
      if (data.isSegmentedPlayback) {
        setCurrentSegmentIndex(data.currentSegmentIndex)
        setIsPlaying(data.isPlaying)
      } else {
        setCurrentSegmentIndex(-1)
        setIsPlaying(false)
      }
    }

    // 添加事件监听器
    window.addEventListener('tts-segmented-playback-update', handleSegmentedPlaybackUpdate as EventListener)

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('tts-segmented-playback-update', handleSegmentedPlaybackUpdate as EventListener)
    }
  }, [])

  // 处理段落点击
  // 使用 useCallback 记忆化函数，避免不必要的重新创建
  const handleSegmentClick = useCallback((index: number) => {
    TTSService.playFromSegment(index)
  }, [])

  // 使用 useMemo 记忆化列表渲染结果，避免不必要的重新计算
  const renderedSegments = useMemo(() => {
    if (segments.length === 0) {
      return <div>{text}</div>;
    }

    return segments.map((segment, index) => (
      <TextSegment
        key={index}
        className={index === currentSegmentIndex ? 'active' : ''}
        onClick={() => handleSegmentClick(index)}>
        {segment}
      </TextSegment>
    ))
  }, [segments, currentSegmentIndex, handleSegmentClick, text])

  return <TextContainer>{renderedSegments}</TextContainer>
}

const TextContainer = styled.div`
  display: inline;
`

const TextSegment = styled.span`
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: var(--color-primary-bg);
    border-radius: 2px;
  }
`

// 使用 memo 包装组件，避免不必要的重渲染
export default memo(TTSHighlightedText)
