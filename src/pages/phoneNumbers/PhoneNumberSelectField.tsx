import React, {useCallback, useState} from 'react'
import CountryFlag from 'react-country-flag'

import {PhoneNumber} from 'models/phoneNumber/types'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {IntegrationType} from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import PhoneNumberCreateModalForm from 'pages/phoneNumbers/PhoneNumberCreateModalForm'
import useAppSelector from 'hooks/useAppSelector'

import css from './PhoneNumberSelectField.less'

type Props = {
    value: Maybe<PhoneNumber> | '_new'
    onChange: (phoneNumber: PhoneNumber) => void
    onCreate: (phoneNumber: PhoneNumber) => void
    integrationType?: IntegrationType.Phone | IntegrationType.Sms
}

function PhoneNumberSelectField({
    value,
    onChange,
    onCreate,
    integrationType,
}: Props): JSX.Element {
    const phoneNumbers: Record<number, PhoneNumber> =
        useAppSelector(getPhoneNumbers)

    const [isCreateFormVisible, setIsCreateFormVisible] = useState(
        value === '_new'
    )

    const handleSelection = useCallback(
        (value: string | number) => {
            if (typeof value === 'string' && value === '_new') {
                setIsCreateFormVisible(true)
            } else if (typeof value === 'number') {
                const number = phoneNumbers[value]
                if (number) {
                    onChange(number)
                }
            }
        },
        [phoneNumbers, onChange]
    )

    const availableNumbers = Object.entries(phoneNumbers)
        .filter(([, phoneNumber]) => {
            const existingIntegration = phoneNumber.integrations.find(
                (integration) => integration.type === integrationType
            )
            return !existingIntegration
        })
        .map(([, phoneNumber]) => phoneNumber)

    const options = [
        {
            value: '_new',
            label: (
                <div className={css.createLabel}>
                    <i className="material-icons">add</i>
                    <span>Create phone number</span>
                </div>
            ),
        },
        ...availableNumbers.map((phoneNumber) => {
            const {name} = phoneNumber
            const {country, friendly_name} = phoneNumber.meta
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
                        {name} - {country} ({friendly_name})
                    </>
                ),
                text: `${name} ${country} ${friendly_name}`,
            }
        }),
    ]

    return (
        <>
            <SelectField
                id="phoneNumber"
                placeholder="Select number"
                onChange={handleSelection}
                options={options}
                value={value !== '_new' ? value?.id : undefined}
                fullWidth
            />
            <PhoneNumberCreateModalForm
                isOpen={isCreateFormVisible}
                onClose={() => setIsCreateFormVisible(false)}
                onCreate={onCreate}
            />
        </>
    )
}

export default PhoneNumberSelectField
