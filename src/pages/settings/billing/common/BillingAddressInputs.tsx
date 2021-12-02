import React, {useMemo} from 'react'
import {Row, Col} from 'reactstrap'
import produce from 'immer'

import InputField from '../../../common/forms/InputField'
import untypedCountries from '../../../../config/countries.json'
import {SelectableOption} from '../../../common/forms/SelectField/types'
import {BillingContact} from '../../../../state/billing/types'

import css from './BillingAddressInputs.less'

// $TsFixMe remove casting once countries is migrated
const countries = untypedCountries as SelectableOption[]

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
                help="Invoices are sent to this email address."
                label="Email"
                name="email"
                onChange={(email) =>
                    handleFormChange((nextForm) => {
                        nextForm.email = email
                    })
                }
                placeholder="your@email.com"
                required
                type="email"
                value={value.email}
            />

            <Row className={css.formRow}>
                <Col className={css.formColumn} lg={6}>
                    <InputField
                        name="name"
                        label="Company name"
                        onChange={(name) =>
                            handleFormChange((nextForm) => {
                                nextForm.shipping.name = name
                            })
                        }
                        placeholder="e.g. Gorgias"
                        type="text"
                        value={value.shipping.name}
                    />
                </Col>
                <Col className={css.formColumn} lg={6}>
                    <InputField
                        label="Phone number"
                        name="phone"
                        onChange={(phone) =>
                            handleFormChange((nextForm) => {
                                nextForm.shipping.phone = phone
                            })
                        }
                        placeholder="415 859 3010"
                        type="tel"
                        value={value.shipping.phone}
                    />
                </Col>
            </Row>
            <InputField
                label="Street address"
                name="line1"
                onChange={(address) =>
                    handleFormChange((nextForm) => {
                        nextForm.shipping.address.line1 = address
                    })
                }
                placeholder="Gorgias Street"
                type="text"
                required
                value={value.shipping.address.line1}
            />
            <InputField
                label="Suite/Unit"
                name="line2"
                onChange={(addressComplement) =>
                    handleFormChange((nextForm) => {
                        nextForm.shipping.address.line2 = addressComplement
                    })
                }
                placeholder="e.g. Unit #2, Floor 5"
                type="text"
                value={value.shipping.address.line2}
            />
            <Row className={css.formRow}>
                <Col className={css.formColumn} lg={6}>
                    <InputField
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
                    </InputField>
                </Col>
                <Col className={css.formColumn} lg={6}>
                    <InputField
                        label="Zip code"
                        name="postalCode"
                        onChange={(postalCode) =>
                            handleFormChange((nextForm) => {
                                nextForm.shipping.address.postal_code =
                                    postalCode
                            })
                        }
                        placeholder="94103"
                        required
                        type="text"
                        value={value.shipping.address.postal_code}
                    />
                </Col>
            </Row>
            <Row className={css.formRow}>
                <Col className={css.formColumn} lg={isCountryUnitedStates && 6}>
                    <InputField
                        name="city"
                        label="City"
                        onChange={(city) =>
                            handleFormChange((nextForm) => {
                                nextForm.shipping.address.city = city
                            })
                        }
                        placeholder="New York"
                        required
                        type="text"
                        value={value.shipping.address.city}
                    />
                </Col>
                {isCountryUnitedStates && (
                    <Col className={css.formColumn} lg={6}>
                        <InputField
                            label="State"
                            name="state"
                            onChange={(state) =>
                                handleFormChange((nextForm) => {
                                    nextForm.shipping.address.state = state
                                })
                            }
                            placeholder="CA"
                            required
                            type="text"
                            value={value.shipping.address.state}
                        />
                    </Col>
                )}
            </Row>
        </>
    )
}
