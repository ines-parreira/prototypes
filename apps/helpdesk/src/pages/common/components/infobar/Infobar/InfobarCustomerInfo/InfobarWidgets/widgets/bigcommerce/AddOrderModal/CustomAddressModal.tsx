import React, { useState } from 'react'

import classNames from 'classnames'
import { CountryCode } from 'libphonenumber-js'
import { Form } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    BigCommerceCustomerAddress,
    BigCommerceCustomerAddressType,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
} from 'models/integration/types'
import IconButton from 'pages/common/components/button/IconButton'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import CheckBox from 'pages/common/forms/CheckBox'
import CountryInput from 'pages/common/forms/CountryInput/CountryInput'
import { getCountryLabel } from 'pages/common/forms/CountryInput/utils'
import InputField from 'pages/common/forms/input/InputField'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import ProvinceInput from 'pages/common/forms/ProvinceInput/ProvinceInput'

import { createCustomAddress } from './utils'

import cssAddressesDropdown from './AddressesDropdown.less'
import cssOrderModal from './OrderModal.less'

type Props = {
    onAddCustomAddress: (
        newSelectedAddress: BigCommerceCustomerAddress,
        addressType: 'billing' | 'shipping',
        customerEmail: Maybe<string>,
    ) => void
    addressType: 'billing' | 'shipping'
    currencyCode: string
    customerEmail: Maybe<string>
    isOpen: boolean
    integrationId: number
    customerId?: number
    onOpen: () => void
    onClose: () => void
}

type FormState = {
    email: string
    firstName: string
    lastName: string
    address1: string
    address2: string
    addressType: BigCommerceCustomerAddressType
    city: string
    company: string
    country: string
    countryCode: CountryCode
    phone: string
    postalCode: string
    stateOrProvince: string
}

const initialState: FormState = {
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    addressType: BigCommerceCustomerAddressType.Residential,
    city: '',
    company: '',
    country: 'United States',
    countryCode: 'US',
    phone: '',
    postalCode: '',
    stateOrProvince: '',
}

export function CustomAddressModal({
    onAddCustomAddress,
    addressType,
    currencyCode,
    customerEmail,
    isOpen,
    integrationId,
    customerId,
    onOpen: onOpenProp,
    onClose: onCloseProp,
}: Props) {
    const [formState, setFormState] = useState<FormState>(initialState)
    const [saveToCustomersAddressBook, setSaveToCustomersAddressBook] =
        useState(true)
    const [isStateOrProvinceInvalid, setIsStateOrProvinceInvalid] =
        useState(false)
    const [performedValidation, setPerformedValidation] = useState(false)

    const onClose = () => {
        onCloseProp()
        setFormState(initialState)
        setIsStateOrProvinceInvalid(false)
        setPerformedValidation(false)
    }

    const onToggle = () => {
        if (isOpen) {
            return onClose()
        }

        return onOpenProp()
    }

    const isFormValid = () => {
        return (
            !!formState.firstName &&
            !!formState.lastName &&
            !!formState.city &&
            !!formState.stateOrProvince &&
            !!formState.postalCode &&
            formState.postalCode.length > 1 &&
            !!formState.countryCode &&
            !!formState.address1
        )
    }

    const handleAddCustomAddress = async () => {
        const address: BigCommerceCustomerAddress = {
            id: 0,
            email: formState.email,
            first_name: formState.firstName,
            last_name: formState.lastName,
            address1: formState.address1,
            address2: formState.address2,
            address_type: formState.addressType,
            city: formState.city,
            company: formState.company,
            country: formState.country,
            country_code: formState.countryCode,
            customer_id: 1,
            phone: formState.phone,
            postal_code: formState.postalCode,
            state_or_province: formState.stateOrProvince,
        }
        setPerformedValidation(true)

        if (isFormValid()) {
            if (saveToCustomersAddressBook && customerId) {
                try {
                    await createCustomAddress({
                        integrationId,
                        address: {
                            ...address,
                            customer_id: customerId,
                        },
                    })
                } catch (error) {
                    if (
                        error instanceof BigCommerceGeneralError &&
                        error.message ===
                            BigCommerceGeneralErrorMessage.rateLimitingError
                    ) {
                        onClose()
                    } else {
                        setIsStateOrProvinceInvalid(true)
                        return
                    }
                }
            }

            onAddCustomAddress(address, addressType, customerEmail)
            onClose()
        }
    }
    const onChange = (changes: any) =>
        setFormState({ ...formState, ...changes })

    return (
        <>
            <IconButton
                intent="secondary"
                className="ml-2"
                onClick={onToggle}
                isDisabled={!currencyCode}
            >
                add
            </IconButton>
            <div
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    size="small"
                    isScrollable
                >
                    <div
                        className={classNames(
                            cssOrderModal.wrapper,
                            cssOrderModal.scrollable,
                        )}
                    >
                        <Form onSubmit={handleAddCustomAddress}>
                            <InputField
                                name="firstName"
                                label="First Name"
                                className="mb-2"
                                value={formState.firstName}
                                isRequired
                                onChange={(firstName) =>
                                    onChange({ firstName })
                                }
                                hasError={
                                    performedValidation && !formState.firstName
                                }
                                data-1p-ignore
                            />
                            <InputField
                                name="lastName"
                                label="Last Name"
                                className="mb-2"
                                value={formState.lastName}
                                isRequired
                                onChange={(lastName) => onChange({ lastName })}
                                hasError={
                                    performedValidation && !formState.lastName
                                }
                                data-1p-ignore
                            />
                            <InputField
                                name="company"
                                label="Company"
                                className="mb-2"
                                value={formState.company}
                                onChange={(company) => onChange({ company })}
                                data-1p-ignore
                            />
                            <PhoneNumberInput
                                label="Phone"
                                value={formState.phone}
                                onChange={(phone) => onChange({ phone })}
                                data-1p-ignore
                            />
                            <InputField
                                name="address1"
                                label="Address 1"
                                className={classNames(
                                    'mb-2',
                                    cssAddressesDropdown.topPadded,
                                )}
                                value={formState.address1}
                                isRequired
                                onChange={(address1) => onChange({ address1 })}
                                hasError={
                                    performedValidation && !formState.address1
                                }
                                data-1p-ignore
                            />
                            <InputField
                                name="address2"
                                label="Address 2"
                                className="mb-2"
                                value={formState.address2}
                                onChange={(address2) => onChange({ address2 })}
                                data-1p-ignore
                            />
                            <InputField
                                name="city"
                                label="City"
                                className="mb-2"
                                value={formState.city}
                                isRequired
                                onChange={(city) => onChange({ city })}
                                hasError={
                                    performedValidation && !formState.city
                                }
                                data-1p-ignore
                            />
                            <CountryInput
                                label="Country"
                                value={formState.countryCode}
                                onChange={(countryCode) =>
                                    onChange({
                                        countryCode: countryCode as CountryCode,
                                        country: getCountryLabel(countryCode),
                                        stateOrProvince: '',
                                    })
                                }
                                popularCountries={['AU', 'CA', 'GB', 'US']}
                                data-1p-ignore
                            />
                            <ProvinceInput
                                label="State or province"
                                name="stateOrProvince"
                                country={formState.country}
                                onChange={(stateOrProvince) =>
                                    onChange({ stateOrProvince })
                                }
                                hasError={
                                    performedValidation &&
                                    (!formState.stateOrProvince ||
                                        isStateOrProvinceInvalid)
                                }
                                error={
                                    isStateOrProvinceInvalid
                                        ? 'Invalid state or province'
                                        : ''
                                }
                                isRequired
                                data-1p-ignore
                            />
                            <InputField
                                name="zip"
                                label="ZIP/Postal code"
                                className="mb-2"
                                value={formState.postalCode}
                                isRequired
                                onChange={(postalCode) =>
                                    onChange({ postalCode })
                                }
                                hasError={
                                    performedValidation &&
                                    (!formState.postalCode ||
                                        formState.postalCode.length < 2)
                                }
                                data-1p-ignore
                            />
                            <CheckBox
                                isChecked={saveToCustomersAddressBook}
                                className="mt-3 mb-3"
                                onChange={() => {
                                    setSaveToCustomersAddressBook(
                                        !saveToCustomersAddressBook,
                                    )
                                }}
                            >
                                {`Save to customer's address book`}
                            </CheckBox>
                        </Form>
                    </div>
                    <ModalFooter className={cssOrderModal.wrapper}>
                        <div className={cssOrderModal.actions}>
                            <Button
                                tabIndex={0}
                                intent="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                intent="primary"
                                tabIndex={0}
                                onClick={handleAddCustomAddress}
                                isDisabled={false}
                            >
                                Create Address
                            </Button>
                        </div>
                    </ModalFooter>
                </Modal>
            </div>
        </>
    )
}
