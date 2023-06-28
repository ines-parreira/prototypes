import React, {ChangeEvent, ReactNode, useCallback} from 'react'

import Button from 'pages/common/components/button/Button'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {notificationSounds} from 'services'
import {sounds, SoundValue} from 'services/NotificationSounds'

import css from './SoundSetting.less'

type Props = {
    className?: string
    description: ReactNode
    enabled: boolean
    sound: SoundValue
    title: string
    volume: number
    onChangeEnabled: (enabled: boolean) => void
    onChangeSound: (sound: SoundValue) => void
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
    const handleChangeSound = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            onChangeSound(e.target.value as SoundValue)
        },
        [onChangeSound]
    )

    const handleChangeVolume = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onChangeVolume(parseInt(e.target.value, 10))
        },
        [onChangeVolume]
    )

    const handleTestSound = useCallback(() => {
        notificationSounds.play(sound, volume)
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

                <select
                    disabled={!enabled}
                    value={sound}
                    onChange={handleChangeSound}
                >
                    {sounds.map((sound) => (
                        <option key={sound.value} value={sound.value}>
                            {sound.label}
                        </option>
                    ))}
                </select>
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
