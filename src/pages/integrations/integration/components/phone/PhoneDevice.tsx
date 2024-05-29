import React from 'react'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'

import css from './PhoneDevice.less'
import PhoneDeviceDialer from './PhoneDeviceDialer'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    target: React.RefObject<HTMLElement | null>
}

export default function PhoneDevice({isOpen, setIsOpen, target}: Props) {
    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement="right-start"
            className={css.dropdownWrapper}
        >
            <DropdownBody className={css.dropdownBody}>
                <PhoneDeviceDialer />
            </DropdownBody>
        </Dropdown>
    )
}
