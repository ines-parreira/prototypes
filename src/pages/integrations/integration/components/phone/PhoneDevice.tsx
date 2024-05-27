import React, {useState} from 'react'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import css from './PhoneDevice.less'
import DialPad from './DialPad'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    target: React.RefObject<HTMLElement | null>
}

export default function PhoneDevice({isOpen, setIsOpen, target}: Props) {
    const [inputValue, setInputValue] = useState('')

    const handleChange = (value: string) => {
        setInputValue(value)
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement="right-start"
            className={css.dropdownWrapper}
        >
            <DropdownBody className={css.dropdownBody}>
                <PhoneNumberInput
                    onChange={handleChange}
                    value={inputValue}
                    autoFocus
                />

                <div className={css.dialpad}>
                    <DialPad onChange={handleChange} value={inputValue} />
                </div>

                <div className={css.buttons}>
                    <Button fillStyle="ghost" size="small" intent="secondary">
                        <ButtonIconLabel icon="phone" />
                        Select integration
                        <ButtonIconLabel icon="arrow_drop_down" />
                    </Button>
                    <Button>Call</Button>
                </div>
            </DropdownBody>
        </Dropdown>
    )
}
