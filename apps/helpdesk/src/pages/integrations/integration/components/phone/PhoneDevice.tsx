import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'

import { PhoneDeviceDialer } from './PhoneDeviceDialer'

import css from './PhoneDevice.less'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    target: React.RefObject<HTMLElement | null>
}

export function PhoneDevice({ isOpen, setIsOpen, target }: Props) {
    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement="right-start"
            className={css.dropdownWrapper}
        >
            <DropdownBody className={css.dropdownBody}>
                <PhoneDeviceDialer onCallInitiated={() => setIsOpen(false)} />
            </DropdownBody>
        </Dropdown>
    )
}
