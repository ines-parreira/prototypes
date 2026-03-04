import React, { useRef, useState } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './ActionsPlatformTrackstarIntegrationSelectBox.less'

const TRACKSTAR_INTEGRATIONS = [
    'sandbox',
    'shiphero',
    'shipstation',
    'shipbob',
    'dear-systems',
    'deposco',
] as const
type AvailableIntegraion = (typeof TRACKSTAR_INTEGRATIONS)[number]
type Props = {
    value: AvailableIntegraion
    onChange: (value: AvailableIntegraion) => void
    isDisabled?: boolean
}

const ActionsPlatformTrackstarIntegrationSelectBox = ({
    value,
    onChange,
    isDisabled,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={css.container}>
            <Label isRequired>Trackstar Integration</Label>
            <SelectInputBox
                floating={floatingRef}
                placeholder="Select Trackstar Integration"
                ref={targetRef}
                onToggle={setIsOpen}
                isDisabled={isDisabled}
                label={value}
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
                                {TRACKSTAR_INTEGRATIONS.map((value) => (
                                    <DropdownItem
                                        key={value}
                                        option={{
                                            value,
                                            label: value,
                                        }}
                                        onClick={onChange}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ActionsPlatformTrackstarIntegrationSelectBox
