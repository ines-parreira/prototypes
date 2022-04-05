import React, {useMemo} from 'react'
import produce from 'immer'
import classnames from 'classnames'

import untypedCountries from 'config/countries.json'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import InputField from 'pages/common/forms/input/InputField'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import settingsCss from 'pages/settings/settings.less'
import {BillingContact} from 'state/billing/types'

import css from './BillingAddressInputs.less'

const countries: SelectableOption[] = untypedCountries

type Props = {
    onChange: (value: BillingContact) => void
    value: BillingContact
}

export default function BillingAddressInputs({onChange, value}: Props) {
    const isCountryUnitedStates = useMemo(
        () => value.shipping.address.country === 'US',
        [value]
    )
    const handleFormChange = (cb: (nextForm: BillingContact) => void) => {
        onChange(produce(value, cb))
    }

    return (
        <>
            <InputField
                className={settingsCss.mb16}
                caption="Invoices are sent to this email address."
                label="Email"
                name="email"
                onChange={(email) =>
                    handleFormChange((nextForm) => {
                        nextForm.email = email
                    })
                }
                placeholder="your@email.com"
                isRequired
                type="email"
                value={value.email}
            />

            <div className={classnames(css.row, settingsCss.mb16)}>
                <InputField
                    className={css.inputRow}
                    id="name"
                    label="Company name"
                    onChange={(name) =>
                        handleFormChange((nextForm) => {
                            nextForm.shipping.name = name
                        })
                    }
                    placeholder="e.g. Gorgias"
                    value={value.shipping.name}
                />
                <InputField
                    className={css.inputRow}
                    label="Phone number"
                    id="phone"
                    onChange={(phone) =>
                        handleFormChange((nextForm) => {
                            nextForm.shipping.phone = phone
                        })
                    }
                    placeholder="415 859 3010"
                    type="tel"
                    value={value.shipping.phone}
                />
            </div>
            <InputField
                className={settingsCss.mb16}
                label="Street address"
                name="line1"
                onChange={(address) =>
                    handleFormChange((nextForm) => {
                        nextForm.shipping.address.line1 = address
                    })
                }
                placeholder="Gorgias Street"
                type="text"
                isRequired
                value={value.shipping.address.line1}
            />
            <InputField
                className={settingsCss.mb16}
                label="Suite/Unit"
                id="line2"
                onChange={(addressComplement) =>
                    handleFormChange((nextForm) => {
                        nextForm.shipping.address.line2 = addressComplement
                    })
                }
                placeholder="e.g. Unit #2, Floor 5"
                value={value.shipping.address.line2}
            />

            <div className={classnames(css.row, settingsCss.mb16)}>
                <DEPRECATED_InputField
                    className={css.inputRow}
                    name="country"
                    label="Country"
                    onChange={(country) =>
                        handleFormChange((nextForm) => {
                            nextForm.shipping.address.country = country
                            if (country !== 'US') {
                                nextForm.shipping.address.state = ''
                            }
                        })
                    }
                    required
                    type="select"
                    value={value.shipping.address.country}
                >
                    <option value="">-</option>
                    {countries.map(({label, value}) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </DEPRECATED_InputField>
                <InputField
                    className={css.inputRow}
                    label="Zip code"
                    id="postalCode"
                    onChange={(postalCode) =>
                        handleFormChange((nextForm) => {
                            nextForm.shipping.address.postal_code = postalCode
                        })
                    }
                    placeholder="94103"
                    isRequired
                    value={value.shipping.address.postal_code}
                />
            </div>
            <div className={classnames(css.row, settingsCss.mb32)}>
                <InputField
                    className={css.inputRow}
                    id="city"
                    label="City"
                    onChange={(city) =>
                        handleFormChange((nextForm) => {
                            nextForm.shipping.address.city = city
                        })
                    }
                    placeholder="New York"
                    isRequired
                    value={value.shipping.address.city}
                />
                {isCountryUnitedStates && (
                    <InputField
                        className={css.inputRow}
                        label="State"
                        id="state"
                        onChange={(state) =>
                            handleFormChange((nextForm) => {
                                nextForm.shipping.address.state = state
                            })
                        }
                        placeholder="CA"
                        isRequired
                        value={value.shipping.address.state}
                    />
                )}
            </div>
        </>
    )
}
