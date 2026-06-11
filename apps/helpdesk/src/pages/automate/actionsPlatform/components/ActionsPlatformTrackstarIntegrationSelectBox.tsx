import React, { useRef, useState } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import {
    DefaultExportSelectInputBox as SelectInputBox,
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
    'bluebox',
] as const
type AvailableIntegration = (typeof TRACKSTAR_INTEGRATIONS)[number]
type Props = {
    value: AvailableIntegration
    onChange: (value: AvailableIntegration) => void
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

export { ActionsPlatformTrackstarIntegrationSelectBox }
