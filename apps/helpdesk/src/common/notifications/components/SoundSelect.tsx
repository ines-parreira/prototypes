import React, { useMemo, useRef, useState } from 'react'

import cn from 'classnames'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import { sounds, SoundValue } from 'services/NotificationSounds'

import css from './SoundSelect.less'

type Props = {
    addEmptyValue?: boolean
    disabled?: boolean
    value: '' | SoundValue
    onChange: (sound: '' | SoundValue) => void
}

const emptyOption = { label: '- No sound -', value: '' } as const

export default function SoundSelect({
    addEmptyValue = false,
    disabled = false,
    value,
    onChange,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const selectedSound = useMemo(
        () => sounds.find((s) => s.value === value),
        [value],
    )

    return (
        <SelectInputBox
            isDisabled={disabled}
            floating={floatingRef}
            label={selectedSound ? selectedSound.label : emptyOption.label}
            prefix={
                <i className={cn('material-icons', css.soundIcon)}>volume_up</i>
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
                        value={value}
                    >
                        <DropdownBody>
                            {addEmptyValue && (
                                <DropdownItem
                                    onClick={() => onChange(emptyOption.value)}
                                    key={emptyOption.value}
                                    option={emptyOption}
                                    shouldCloseOnSelect
                                />
                            )}
                            {sounds.map((sound) => (
                                <DropdownItem
                                    onClick={() => onChange(sound.value)}
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
    )
}
