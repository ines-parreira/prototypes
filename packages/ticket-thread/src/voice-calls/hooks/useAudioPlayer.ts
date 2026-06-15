import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { toast } from '@gorgias/axiom'
import { request } from '@gorgias/helpdesk-client'

type UseAudioPlayerProps = {
    url: string
    initialDuration?: number
}

export function useAudioPlayer({
    url,
    initialDuration = 0,
}: UseAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(initialDuration)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)

    function handlePlayPause() {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true)
                })
                .catch(() => {
                    setIsPlaying(false)
                })
        }
    }

    function handleSeek(e: ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value)
        if (audioRef.current) audioRef.current.currentTime = value
        setCurrentTime(value)
    }

    function handleVolumeChange(e: ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value)
        if (audioRef.current) {
            audioRef.current.volume = value
            audioRef.current.muted = false
        }
        setVolume(value)
        setIsMuted(false)
    }

    function handleMuteToggle() {
        const next = !isMuted
        if (audioRef.current) audioRef.current.muted = next
        setIsMuted(next)
    }

    async function handleDownload() {
        try {
            const response = await request<Blob>({
                method: 'GET',
                url,
                responseType: 'blob',
                transformRequest: (
                    data: Record<string, unknown>,
                    headers: Record<string, unknown>,
                ) => {
                    delete headers['X-CSRF-Token']
                    delete headers['X-Gorgias-User-Client']
                    if (headers.common) {
                        // @ts-ignore
                        delete headers.common['X-CSRF-Token']
                        // @ts-ignore
                        delete headers.common['X-Gorgias-User-Client']
                    }
                    return data
                },
            })

            const blobUrl = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.style.display = 'none'
            link.href = blobUrl
            link.setAttribute('download', 'recording.mp3')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch {
            toast.error('Failed to download audio file.')
        }
    }

    function handleSpeedChange(speed: number) {
        if (audioRef.current) audioRef.current.playbackRate = speed
    }

    function onTimeUpdate() {
        setCurrentTime(audioRef.current?.currentTime ?? 0)
    }

    function onLoadedMetadata() {
        setDuration(audioRef.current?.duration ?? 0)
    }

    function onEnded() {
        setIsPlaying(false)
    }

    return {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        handlePlayPause,
        handleSeek,
        handleVolumeChange,
        handleMuteToggle,
        handleDownload,
        handleSpeedChange,
        onTimeUpdate,
        onLoadedMetadata,
        onEnded,
    }
}
