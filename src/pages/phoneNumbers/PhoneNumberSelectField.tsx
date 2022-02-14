import React, {useCallback, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import CountryFlag from 'react-country-flag'

import {RootState} from 'state/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import PhoneNumberCreateModalForm from 'pages/phoneNumbers/PhoneNumberCreateModalForm'

import css from './PhoneNumberSelectField.less'

type OwnProps = {
    value: Maybe<PhoneNumber> | '_new'
    onChange: (phoneNumber: PhoneNumber) => void
    onCreate: (phoneNumber: PhoneNumber) => void
}
type Props = ConnectedProps<typeof connector> & OwnProps

function PhoneNumberSelectField({
    phoneNumbers,
    value,
    onChange,
    onCreate,
}: Props): JSX.Element {
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
        ...Object.entries(phoneNumbers).map(([, phoneNumber]) => {
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

const connector = connect((state: RootState) => ({
    phoneNumbers: state.entities.phoneNumbers,
}))

export default connector(PhoneNumberSelectField)
