import React, { useMemo } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import { countriesRequiringState, Country } from 'config/countries'
import InputField from 'pages/common/forms/input/InputField'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { BillingContact } from 'state/billing/types'

import CountriesDropdown from '../../components/CountriesDropdown/CountriesDropdown'
import {
    emailError,
    emptyError,
    validatePostalCode,
} from '../../utils/validations'

import css from './AddressForm.less'

type AddressFormProps = {
    billingContact: BillingContact
    setBillingContact: (value: React.SetStateAction<BillingContact>) => void
}

const AddressForm = ({
    billingContact,
    setBillingContact,
}: AddressFormProps) => {
    const isStateRequired = useMemo(
        () =>
            billingContact &&
            countriesRequiringState.includes(
                billingContact.shipping.address.country,
            ),
        [billingContact],
    )

    return (
        <div className={css.container}>
            <div>
                <h1 className={css.title}>Billing Information</h1>
            </div>
            <div className={css.form}>
                <div className={css.formRow}>
                    <InputField
                        className={css.formInput}
                        caption="Invoices are sent to this email address."
                        label="Email"
                        name="email"
                        onChange={(email) =>
                            setBillingContact((prev) => ({ ...prev, email }))
                        }
                        placeholder="your@email.com"
                        isRequired
                        type="email"
                        value={billingContact.email}
                        error={emailError(billingContact.email)}
                    />
                </div>
                <div className={css.formRow}>
                    <InputField
                        className={css.formInput}
                        id="name"
                        label="Company name"
                        onChange={(name) =>
                            setBillingContact((prev) => ({
                                ...prev,
                                shipping: { ...prev.shipping, name },
                            }))
                        }
                        placeholder="e.g. Gorgias"
                        value={billingContact.shipping.name}
                    />
                    <div className={css.formInput}>
                        <Label className={css.label}>Phone number</Label>
                        <PhoneNumberInput
                            value={billingContact.shipping.phone || ''}
                            onChange={(phone) =>
                                setBillingContact((prev) => ({
                                    ...prev,
                                    shipping: { ...prev.shipping, phone },
                                }))
                            }
                            placeholder="415 859 3010"
                        />
                    </div>
                </div>
                <div className={css.formRow}>
                    <InputField
                        className={css.formInput}
                        label="Street address"
                        name="line1"
                        onChange={(address) =>
                            setBillingContact((prev) => ({
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    address: {
                                        ...prev.shipping.address,
                                        line1: address,
                                    },
                                },
                            }))
                        }
                        placeholder="Gorgias Street"
                        type="text"
                        isRequired
                        error={emptyError(
                            billingContact.shipping.address.line1,
                            'Street address',
                        )}
                        value={billingContact.shipping.address.line1}
                    />
                </div>
                <div className={css.formRow}>
                    <InputField
                        className={css.formInput}
                        label="Suite/Unit"
                        name="line2"
                        onChange={(addressComplement) =>
                            setBillingContact((prev) => ({
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    address: {
                                        ...prev.shipping.address,
                                        line2: addressComplement,
                                    },
                                },
                            }))
                        }
                        placeholder="e.g. Unit #2, Floor 5"
                        type="text"
                        value={
                            billingContact.shipping.address.line2 ?? undefined
                        }
                    />
                </div>
                <div className={css.formRow}>
                    <div className={css.countryInput}>
                        <Label
                            isRequired
                            className={css.formLabel}
                            htmlFor="country"
                        >
                            Country
                        </Label>
                        <CountriesDropdown
                            country={billingContact.shipping.address.country}
                            onChange={(country: Country) => {
                                setBillingContact((prev) => ({
                                    ...prev,
                                    shipping: {
                                        ...prev.shipping,
                                        address: {
                                            ...prev.shipping.address,
                                            country: country.value,
                                        },
                                    },
                                }))
                            }}
                            error={emptyError(
                                billingContact.shipping.address.country,
                                'Country',
                            )}
                        />
                    </div>
                    <InputField
                        className={css.formInput}
                        label="Zip code"
                        id="postalCode"
                        onChange={(postalCode) =>
                            setBillingContact((prev) => ({
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    address: {
                                        ...prev.shipping.address,
                                        postal_code: postalCode,
                                    },
                                },
                            }))
                        }
                        placeholder="94103"
                        isRequired
                        error={validatePostalCode(
                            billingContact.shipping.address.postal_code,
                            billingContact.shipping.address.country,
                        )}
                        value={billingContact.shipping.address.postal_code}
                    />
                </div>
                <div className={css.formRow}>
                    <InputField
                        className={css.formInput}
                        id="city"
                        label="City"
                        onChange={(city) => {
                            setBillingContact((prev) => ({
                                ...prev,
                                shipping: {
                                    ...prev.shipping,
                                    address: {
                                        ...prev.shipping.address,
                                        city,
                                    },
                                },
                            }))
                        }}
                        placeholder="New York"
                        isRequired
                        error={emptyError(
                            billingContact.shipping.address.city,
                            'City',
                        )}
                        value={billingContact.shipping.address.city}
                    />
                    {isStateRequired && (
                        <InputField
                            className={css.formInput}
                            label="State"
                            id="state"
                            onChange={(state) => {
                                setBillingContact((prev) => ({
                                    ...prev,
                                    shipping: {
                                        ...prev.shipping,
                                        address: {
                                            ...prev.shipping.address,
                                            state,
                                        },
                                    },
                                }))
                            }}
                            placeholder="CA"
                            isRequired
                            value={billingContact.shipping.address.state}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddressForm
