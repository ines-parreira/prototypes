import React, {useEffect, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {fromJS} from 'immutable'
import {AnyAction} from 'redux'
import InputField from 'pages/common/forms/input/InputField'
import {Country, countriesRequiringState} from 'config/countries'
import Label from 'pages/common/forms/Label/Label'
import {getContact} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {BillingContact} from 'state/billing/types'
import Button from 'pages/common/components/button/Button'
import {fetchContact, updateContact} from 'state/billing/actions'
import {UPDATE_BILLING_CONTACT_ERROR} from 'state/billing/constants'
import Loader from 'pages/common/components/Loader/Loader'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import {BILLING_PAYMENT_PATH} from '../../constants'
import CountriesDropdown from '../../components/CountriesDropdown/CountriesDropdown'

import {emailError, emptyError} from '../../utils/validations'
import BackLink from '../../components/BackLink/BackLink'
import css from './BillingInformationView.less'

const BillingInformationView = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const initialBillingContact = useAppSelector(
        getContact
    )?.toJS() as BillingContact
    const [billingContact, setBillingContact] = useState<BillingContact>(
        initialBillingContact
    )
    const [isFetchingData, setIsFetchingData] = useState(true)

    // Fetch billing contact
    useEffect(() => {
        const getBillingShippingContact = async () => {
            if (!initialBillingContact) {
                await fetchContact()(dispatch)
            }
            setIsFetchingData(false)
        }
        void getBillingShippingContact()
    }, [dispatch, initialBillingContact])

    // Set initial values for billing contact
    useEffect(() => {
        if (initialBillingContact && !billingContact) {
            setBillingContact(initialBillingContact)
        }
    }, [initialBillingContact, billingContact])

    const isStateRequired = useMemo(
        () =>
            billingContact &&
            countriesRequiringState.includes(
                billingContact.shipping.address.country
            ),
        [billingContact]
    )

    const handleOnSubmit = async () => {
        const response = (await updateContact(fromJS(billingContact))(
            dispatch
        )) as AnyAction

        if (response.type === UPDATE_BILLING_CONTACT_ERROR) {
            return
        }

        history.push(BILLING_PAYMENT_PATH)
    }

    if (isFetchingData || !initialBillingContact) {
        return <Loader />
    }

    return (
        <div className={css.container}>
            <BackLink />
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
                            setBillingContact((prev) => ({...prev, email}))
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
                                shipping: {...prev.shipping, name},
                            }))
                        }
                        placeholder="e.g. Gorgias"
                        value={billingContact.shipping.name}
                    />
                    <div className={css.formInput}>
                        <Label className={css.label}>Phone number</Label>
                        <PhoneNumberInput
                            value={billingContact.shipping.phone}
                            onChange={(phone) =>
                                setBillingContact((prev) => ({
                                    ...prev,
                                    shipping: {...prev.shipping, phone},
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
                            'Street address'
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
                        value={billingContact.shipping.address.line2}
                    />
                </div>
                <div className={css.formRow}>
                    <div className={css.countryInput}>
                        <Label
                            isRequired
                            className={css.formLabel}
                            htmlFor="country"
                            css={css.formaLabel}
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
                                'Country'
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
                        error={emptyError(
                            billingContact.shipping.address.postal_code,
                            'Zip code'
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
                            'City'
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
                <div className={css.formButtonContainer}>
                    <Button intent="primary" onClick={handleOnSubmit}>
                        Set Address
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BillingInformationView
