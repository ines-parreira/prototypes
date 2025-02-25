import React, { useCallback, useRef, useState } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    IntegrationType,
    IvrForwardCall,
    PhoneIntegration,
} from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'

type Props = {
    value: IvrForwardCall
    onChange: (value: IvrForwardCall) => void
}

const IvrPhoneNumberSelectField = ({ value, onChange }: Props): JSX.Element => {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const phoneIntegrations = useAppSelector(
        getIntegrationsByType<PhoneIntegration>(IntegrationType.Phone),
    )
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const params = useParams<{ integrationId: string }>()
    const currentIntegrationId = parseInt(params.integrationId)
    const availableIntegrations = phoneIntegrations.filter(
        (integration) =>
            integration.id !== currentIntegrationId &&
            integration.meta.phone_number_id &&
            phoneNumbers[integration.meta.phone_number_id],
    )

    const options = availableIntegrations.map((integration) => ({
        value: integration.id,
        label: integration.name,
    }))

    const currentlySelectedOption = availableIntegrations.find(
        (integration) => integration.id === value.integration_id,
    )

    const handleChange = useCallback(
        (integrationId) => {
            const integration = availableIntegrations.find(
                (integration) => integration.id === integrationId,
            )
            if (integration) {
                const phoneNumber =
                    phoneNumbers[integration.meta.phone_number_id]
                if (phoneNumber) {
                    onChange({
                        phone_number: phoneNumber.phone_number,
                        integration_id: integration.id,
                    })
                }
            }
        },
        [availableIntegrations, phoneNumbers, onChange],
    )

    return (
        <SelectInputBox
            onToggle={setIsOpen}
            label={currentlySelectedOption?.name ?? 'Select phone number'}
            ref={selectRef}
            floating={floatingSelectRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingSelectRef}
                        target={selectRef}
                        value={currentlySelectedOption?.id}
                    >
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    option={option}
                                    onClick={() => handleChange(option.value)}
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

export default IvrPhoneNumberSelectField
