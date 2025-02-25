import React, { useEffect, useRef, useState } from 'react'

import CircularProgressBar from './CircularProgressBar'

import css from './CircularAudioPlayer.less'

type Props = {
    src: string
    isActive?: boolean
    onPlay?: () => void
}

const CircularAudioPlayer = ({
    src,
    isActive = false,
    onPlay = () => {},
}: Props) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPaused, setIsPaused] = useState(true)
    const [audioProgress, setAudioProgress] = useState(0)

    const playOrPause = async (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        event.stopPropagation()
        const audio = audioRef.current
        if (!audio) {
            return
        }
        if (audio.paused) {
            await audio.play()
            onPlay()
        } else {
            audio.pause()
        }
    }

    const updateProgressBar = () => {
        const audio = audioRef.current
        if (!audio) {
            return
        }
        const progress = audio.currentTime / audio.duration
        setAudioProgress(progress)
    }

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) {
            return
        }
        if (!isActive) {
            audio.pause()
            audio.currentTime = 0
        }
    }, [isActive])

    return (
        <div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                hidden
                src={src}
                ref={audioRef}
                loop={true}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                onTimeUpdate={updateProgressBar}
            />
            <div>
                <div
                    className={css.playButton}
                    onClick={playOrPause}
                    onMouseDown={(event) => event.preventDefault()}
                >
                    <div className={`material-icons ${css.playButtonIcon}`}>
                        {isPaused ? 'play_arrow' : 'pause'}
                    </div>
                    <div className={css.circularProgressBarContainer}>
                        <CircularProgressBar
                            size={20}
                            thickness={2}
                            progress={audioProgress}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CircularAudioPlayer
