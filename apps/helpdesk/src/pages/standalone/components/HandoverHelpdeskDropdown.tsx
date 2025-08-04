import React, { useRef } from 'react'

import { toPairs } from 'lodash'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
// oxlint-disable-next-line no-named-as-default
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
    SelectInputBoxContextState,
} from 'pages/common/forms/input/SelectInputBox'

import { INTEGRATIONS_MAPPING } from '../constants'
import {
    HelpdeskIntegrationOptions,
    HelpdeskIntegrationProperties,
} from '../types'

type Props = {
    onClick: (
        value: HelpdeskIntegrationOptions,
        context: SelectInputBoxContextState | null,
    ) => void
    selectedThirdParty: HelpdeskIntegrationOptions
    hasError?: boolean
    error?: string | React.ReactNode
}

export const HandoverHelpdeskDropdown: React.FC<Props> = ({
    onClick,
    selectedThirdParty,
    hasError = false,
    error,
}) => {
    const selectRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = React.useState(false)

    // This cast is safe and necessary to ensure TypeScript understands the structure of the integrations mapping.
    const integrationsArray = toPairs(INTEGRATIONS_MAPPING) as Array<
        [HelpdeskIntegrationOptions, HelpdeskIntegrationProperties]
    >

    return (
        <SelectInputBox
            placeholder="Select compatible Helpdesk"
            onToggle={setIsOpen}
            ref={selectRef}
            floating={floatingRef}
            label={INTEGRATIONS_MAPPING[selectedThirdParty].label}
            hasError={hasError}
            error={error}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOpen}
                        target={selectRef}
                        onToggle={() => {
                            context?.onBlur()
                        }}
                        ref={floatingRef}
                    >
                        <DropdownBody>
                            {integrationsArray
                                .filter(([, value]) => value.active)
                                .map(([key, value]) => (
                                    <DropdownItem
                                        key={key}
                                        option={{
                                            label: value.label,
                                            value: key,
                                        }}
                                        onClick={(value) => {
                                            onClick(value, context)
                                        }}
                                        ref={null}
                                    />
                                ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
