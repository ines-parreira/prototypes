import type React from 'react'
import { useEffect, useMemo, useRef } from 'react'

import { Button, Icon } from '@gorgias/axiom'

import { replaceAttachmentURL } from 'utils'

type Props = {
    src: string
    audioState: AudioState
    setAudioState: (state: AudioState) => void
    onLoad?: () => void
    isDisabled?: boolean
}

export enum AudioState {
    PLAYING = 'playing',
    PAUSED = 'paused',
    LOADING = 'loading',
    NEW = 'new',
}

const TTSPreviewButton = ({
    src,
    audioState = AudioState.NEW,
    setAudioState,
    onLoad,
    isDisabled,
}: Props): JSX.Element => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const isLoading = audioState === AudioState.LOADING

    const handleButtonClick = async (event: React.MouseEvent) => {
        event.stopPropagation()
        // load new audio if unset
        if (!src) {
            setAudioState(AudioState.LOADING)
            onLoad?.()
            return
        }

        switch (audioState) {
            case AudioState.PAUSED:
            case AudioState.NEW:
                setAudioState(AudioState.PLAYING)
                break
            case AudioState.PLAYING:
                setAudioState(AudioState.PAUSED)
                break
        }
    }

    // play or pause based on audio state
    useEffect(() => {
        if (!src) {
            return
        }

        switch (audioState) {
            case AudioState.PAUSED:
                audioRef.current?.pause()
                break
            case AudioState.PLAYING:
                audioRef.current?.play()
                break
        }
    }, [src, audioRef, audioState])

    const { icon, label } = useMemo(() => {
        if (audioState === AudioState.LOADING) {
            return {
                icon: undefined,
                label: 'Loading',
            }
        }
        if (audioState === AudioState.PAUSED) {
            return {
                icon: <Icon name="media-play-pause" />,
                label: 'Resume',
            }
        }

        return {
            icon: (
                <i className="material-icons" style={{ fontSize: '20px' }}>
                    {audioState === AudioState.PLAYING ? 'pause' : 'play_arrow'}
                </i>
            ),
            label: audioState === AudioState.PLAYING ? 'Pause' : 'Preview',
        }
    }, [audioState])

    return (
        <div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                hidden
                src={replaceAttachmentURL(src)}
                ref={audioRef}
                loop={false}
                onPlay={() => {
                    setAudioState(AudioState.PLAYING)
                }}
                onPause={() => {
                    setAudioState(AudioState.PAUSED)
                }}
                onEnded={() => {
                    setAudioState(AudioState.NEW)
                }}
            />
            <Button
                variant="secondary"
                onClick={handleButtonClick}
                leadingSlot={icon}
                isLoading={isLoading}
                isDisabled={isDisabled}
            >
                {label}
            </Button>
        </div>
    )
}

export default TTSPreviewButton
