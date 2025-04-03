import React, { useCallback, useState } from 'react'

import { ReactCountryFlag as CountryFlag } from 'react-country-flag'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import SelectFieldDropdownAction from 'pages/common/forms/SelectField/SelectFieldDropdownAction'
import PhoneNumberCreateModalForm from 'pages/phoneNumbers/PhoneNumberCreateModalForm'
import {
    countryCode,
    hasCapability,
    isNewPhoneNumber,
} from 'pages/phoneNumbers/utils'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

type Props = {
    value: Maybe<NewPhoneNumber> | '_new'
    onChange: (phoneNumber: NewPhoneNumber) => void
    onCreate?: (phoneNumber: NewPhoneNumber) => void
    integrationType?: IntegrationType.Phone | IntegrationType.Sms
}

function PhoneNumberSelectField({
    value,
    onChange,
    onCreate,
    integrationType,
}: Props): JSX.Element {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const [isCreateFormVisible, setIsCreateFormVisible] = useState(
        value === '_new',
    )

    const handleSelection = useCallback(
        (value: string | number) => {
            if (typeof value === 'string' && value === '_new') {
                setIsCreateFormVisible(true)
            } else if (typeof value === 'number') {
                const number = phoneNumbers[value]
                if (number && isNewPhoneNumber(number)) {
                    onChange(number)
                }
            }
        },
        [phoneNumbers, onChange],
    )

    const handleCreate = (phoneNumber: NewPhoneNumber) => {
        onCreate?.(phoneNumber)
        onChange(phoneNumber)
    }

    const availableNumbers = Object.values(phoneNumbers)
        .filter((phoneNumber) => {
            return isNewPhoneNumber(phoneNumber)
        })
        .filter((phoneNumber) => {
            const existingIntegration = phoneNumber.integrations.find(
                (integration) => integration.type === integrationType,
            )
            return (
                !existingIntegration &&
                integrationType &&
                hasCapability(phoneNumber, integrationType)
            )
        })

    const options = [
        {
            value: '_new',
            label: (
                <SelectFieldDropdownAction
                    icon={<i className="material-icons">add</i>}
                >
                    <span>Create phone number</span>
                </SelectFieldDropdownAction>
            ),
        },
        ...availableNumbers.map((phoneNumber) => {
            const { name, phone_number_friendly } = phoneNumber
            const country = countryCode(phoneNumber)
            return {
                value: phoneNumber.id,
                label: (
                    <>
                        {country && (
                            <CountryFlag
                                style={{
                                    fontSize: '20px',
                                    marginRight: '5px',
                                }}
                                countryCode={country}
                            />
                        )}{' '}
                        {name} - {country} ({phone_number_friendly})
                    </>
                ),
                text: [name, country, phone_number_friendly].join(' '),
            }
        }),
    ]

    return (
        <>
            <SelectField
                id="phoneNumber"
                aria-label="Phone number"
                placeholder="Select number"
                onChange={handleSelection}
                options={options}
                value={value !== '_new' ? value?.id : undefined}
                fullWidth
            />
            <PhoneNumberCreateModalForm
                isOpen={isCreateFormVisible}
                onClose={() => setIsCreateFormVisible(false)}
                onCreate={handleCreate}
            />
        </>
    )
}

export default PhoneNumberSelectField
