import cn from 'classnames'
import React, {
    ChangeEvent,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
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
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const handleChangeVolume = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onChangeVolume(parseInt(e.target.value, 10))
        },
        [onChangeVolume]
    )

    const handleTestSound = useCallback(() => {
        notificationSounds.play(sound, volume)
    }, [sound, volume])

    const selectedSound = useMemo(
        () => sounds.find((s) => s.value === sound),
        [sound]
    )

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
                    <SelectInputBox
                        isDisabled={!enabled}
                        floating={floatingRef}
                        label={selectedSound?.label}
                        prefix={
                            <i className={cn('material-icons', css.soundIcon)}>
                                volume_up
                            </i>
                        }
                        onToggle={setIsOpen}
                        ref={targetRef}
                    >
                        <SelectInputBoxContext.Consumer>
                            {(context) => (
                                <Dropdown
                                    isOpen={isOpen}
                                    onToggle={() => context!.onBlur()}
                                    ref={floatingRef}
                                    target={targetRef}
                                    value={sound}
                                >
                                    <DropdownBody>
                                        {sounds.map((sound) => (
                                            <DropdownItem
                                                onClick={() =>
                                                    onChangeSound(sound.value)
                                                }
                                                key={sound.value}
                                                option={sound}
                                                shouldCloseOnSelect
                                            />
                                        ))}
                                    </DropdownBody>
                                </Dropdown>
                            )}
                        </SelectInputBoxContext.Consumer>
                    </SelectInputBox>
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
