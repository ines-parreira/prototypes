import React, { FormEvent, useState } from 'react'

import { Map } from 'immutable'

import { Button } from '@gorgias/merchant-ui-kit'

import CustomerDeliveryInformation from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerDeliveryInformation/CustomerDeliveryInformation'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ShopifyStoreSelect from 'pages/common/components/ShopifyStoreSelect/ShopifyStoreSelect'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/input/InputField'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'

import { useCustomerSyncForm } from './useCustomerSyncForm'

import css from './CustomerSyncForm.less'

interface Props {
    activeCustomer: Map<string, any>
    isCustomerSyncFormOpen: boolean
    setIsCustomerSyncFormOpen: (isOpen: boolean) => void
}

export default function CustomerSyncForm({
    activeCustomer,
    isCustomerSyncFormOpen,
    setIsCustomerSyncFormOpen,
}: Props) {
    const { formState, resetFormState, onChange, isFormValid } =
        useCustomerSyncForm()
    const [performedValidation, setPerformedValidation] = useState(false)

    const handleSyncModalClose = () => {
        setPerformedValidation(false)
        resetFormState()
        setIsCustomerSyncFormOpen(false)
    }

    const handleSyncCustomer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPerformedValidation(true)

        if (isFormValid()) {
            //TODO: Implement sync customer API calls
        }
    }

    return (
        <Modal
            isOpen={isCustomerSyncFormOpen}
            classNameDialog={css.customerSyncForm}
            onClose={handleSyncModalClose}
        >
            <ModalHeader
                title={`Sync customer  ${activeCustomer.get('name') as string} with Shopify`}
            />
            <form onSubmit={handleSyncCustomer}>
                <ModalBody>
                    <div className={css.formContainer}>
                        <ShopifyStoreSelect
                            activeCustomer={activeCustomer}
                            formState={formState}
                            onChange={onChange}
                            hasError={performedValidation && !formState.store}
                        />
                        <h3>Contact Information</h3>
                        <InputField
                            name="email"
                            label="Email"
                            placeholder="sam.hopper@gmail.com"
                            value={formState.email}
                            onChange={(email) => onChange({ email })}
                            error={
                                performedValidation && !formState.email
                                    ? 'Please enter a valid email address to sync this profile with Shopify. Syncing requires the customer’s email.'
                                    : ''
                            }
                        />

                        <InputField
                            name="name"
                            label="Name"
                            placeholder="Sam Hopper"
                            value={formState.name}
                            onChange={(name) => onChange({ name })}
                        />

                        <PhoneNumberInput
                            label="Phone number"
                            placeholder="000-000-0000"
                            name="phone"
                            value={formState.phone}
                            onChange={(phone) => onChange({ phone })}
                        />

                        <CheckBox
                            isChecked={formState.deliveryAddressChecked}
                            className="mt-3 mb-3"
                            onChange={() =>
                                onChange({
                                    deliveryAddressChecked:
                                        !formState.deliveryAddressChecked,
                                })
                            }
                        >
                            {`Add delivery address`}
                        </CheckBox>
                        {formState.deliveryAddressChecked && (
                            <CustomerDeliveryInformation
                                formState={formState}
                                onChange={onChange}
                                performedValidation={performedValidation}
                            />
                        )}
                    </div>
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={handleSyncModalClose}>
                        Cancel
                    </Button>
                    <Button type="submit" intent="primary">
                        Sync Profile
                    </Button>
                </ModalActionsFooter>
            </form>
        </Modal>
    )
}
