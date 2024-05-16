import React, {ChangeEvent, ReactNode, useCallback, useRef} from 'react'

import {SoundSelect} from 'common/notifications'
import useMouseRelease from 'hooks/useMouseRelease'
import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {notificationSounds} from 'services'
import {SoundValue} from 'services/NotificationSounds'

import css from './SoundSetting.less'

type Props = {
    className?: string
    description: ReactNode
    enabled: boolean
    sound: '' | SoundValue
    title: string
    volume: number
    onChangeEnabled: (enabled: boolean) => void
    onChangeSound: (sound: '' | SoundValue) => void
    onChangeVolume: (volume: number) => void
}

export default function SoundSetting({
    className,
    description,
    enabled,
    sound,
    title,
    volume,
    onChangeEnabled,
    onChangeSound,
    onChangeVolume,
}: Props) {
    const volumeRef = useRef<number>(volume)

    const handleMouseUp = useCallback(() => {
        if (sound) {
            notificationSounds.play(sound, volumeRef.current)
        }
    }, [sound])

    const onMouseDown = useMouseRelease(handleMouseUp)

    const handleChangeSound = useCallback(
        (sound: '' | SoundValue) => {
            if (sound) {
                notificationSounds.play(sound, volume)
            }
            onChangeSound(sound)
        },
        [onChangeSound, volume]
    )

    const handleChangeVolume = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const volume = parseInt(e.target.value, 10)
            volumeRef.current = volume
            onChangeVolume(volume)
        },
        [onChangeVolume]
    )

    const handleTestSound = useCallback(() => {
        if (sound) {
            notificationSounds.play(sound, volume)
        }
    }, [sound, volume])

    return (
        <div className={className}>
            <div className={css.header}>
                <ToggleInput
                    caption={description}
                    isToggled={enabled}
                    onClick={onChangeEnabled}
                >
                    {title}
                </ToggleInput>

                <div className={css.soundSelect}>
                    <SoundSelect value={sound} onChange={handleChangeSound} />
                </div>
            </div>
            <div className={css.volume}>
                <input
                    disabled={!enabled}
                    type="range"
                    className={css.slider}
                    max={10}
                    min={1}
                    value={volume}
                    onChange={handleChangeVolume}
                    onMouseDown={onMouseDown}
                />
                <Button
                    fillStyle="ghost"
                    size="small"
                    onClick={handleTestSound}
                >
                    Test Sound
                </Button>
            </div>
        </div>
    )
}
