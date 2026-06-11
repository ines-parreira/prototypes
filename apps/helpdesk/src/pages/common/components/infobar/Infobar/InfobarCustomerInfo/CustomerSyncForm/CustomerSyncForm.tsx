import type { FormEvent } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { Map } from 'immutable'

import {
    LegacyButton as Button,
    LegacyTextField as TextField,
    toast,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import {
    useListCustomerIntegrationsWithChannelDefault,
    useScheduleShopifyCreateNewCustomerAction,
    useScheduleShopifyUpdateCustomerAction,
} from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/constants'
import { CustomerDeliveryInformation } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerDeliveryInformation/CustomerDeliveryInformation'
import { DefaultExportModal as Modal } from 'pages/common/components/modal/Modal'
import { ModalActionsFooter } from 'pages/common/components/modal/ModalActionsFooter'
import { DefaultExportModalBody as ModalBody } from 'pages/common/components/modal/ModalBody'
import { ModalHeader } from 'pages/common/components/modal/ModalHeader'
import { ShopifyStoreSelect } from 'pages/common/components/ShopifyStoreSelect/ShopifyStoreSelect'
import { DefaultExportCheckBox as CheckBox } from 'pages/common/forms/CheckBox'
import { DefaultExportPhoneNumberInput as PhoneNumberInput } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'

import { selectNormalizedIntegrations } from '../../../../ShopifyStoreSelect/helpers'
import { useCustomerSyncForm } from './useCustomerSyncForm'

import css from './CustomerSyncForm.less'

const CUSTOMER_SYNC_TOAST_ID = 'customer-sync-to-shopify'

interface Props {
    activeCustomer: Map<string, any>
    isCustomerSyncFormOpen: boolean
    setIsCustomerSyncFormOpen: (isOpen: boolean) => void
}

export function CustomerSyncForm({
    activeCustomer,
    isCustomerSyncFormOpen,
    setIsCustomerSyncFormOpen,
}: Props) {
    const {
        mutate: createCustomer,
        isLoading: isCreateCustomerLoading,
        isSuccess: isCreateCustomerSuccess,
        isError: isCreateCustomerError,
        error: createCustomerError,
    } = useScheduleShopifyCreateNewCustomerAction()
    const {
        mutate: updateCustomer,
        isLoading: isUpdateCustomerLoading,
        isSuccess: isUpdateCustomerSuccess,
        isError: isUpdateCustomerError,
        error: updateCustomerError,
    } = useScheduleShopifyUpdateCustomerAction()

    const {
        formState,
        resetFormState,
        resetEmailState,
        onChange,
        isFormValid,
    } = useCustomerSyncForm(activeCustomer)
    const [performedValidation, setPerformedValidation] = useState(false)

    const { data: shopifyStores } =
        useListCustomerIntegrationsWithChannelDefault(
            activeCustomer.get('id'),
            IntegrationType.Shopify,
            undefined,
            {
                query: {
                    retry: 1,
                    refetchOnWindowFocus: false,
                    select: selectNormalizedIntegrations,
                },
            },
        )

    const isUpdateCustomer: boolean = useMemo(() => {
        return shopifyStores
            ?.find(
                (store: Map<any, any>) => store.get('id') === formState.store,
            )
            ?.get('hasCustomerData')
    }, [shopifyStores, formState.store])

    useEffect(() => {
        if (
            !isUpdateCustomer &&
            formState.email !== activeCustomer.get('email')
        ) {
            resetEmailState()
        }
    }, [activeCustomer, formState.email, isUpdateCustomer, resetEmailState])

    const handleSyncModalClose = useCallback(() => {
        setPerformedValidation(false)
        resetFormState()
        setIsCustomerSyncFormOpen(false)
    }, [resetFormState, setIsCustomerSyncFormOpen])

    const handleSyncCustomer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPerformedValidation(true)

        if (isFormValid()) {
            let firstName = formState.name.split(' ')[0]
            let lastName = formState.name.split(' ')[1]

            if (isUpdateCustomer) {
                updateCustomer({
                    integrationId: formState.store,
                    data: {
                        email: formState.email,
                        first_name: firstName,
                        last_name: lastName,
                        phone: formState.phone ? formState.phone : null,
                        address: formState.deliveryAddressChecked
                            ? {
                                  address1: formState.address,
                                  address2: formState.apartment,
                                  company: formState.company,
                                  city: formState.city,
                                  country_code: formState.countryCode,
                                  zip: formState.postalCode,
                                  province_code: formState.stateOrProvince,
                                  phone: formState.defaultAddressPhone || null,
                              }
                            : undefined,
                    },
                    params: {
                        customer_id: activeCustomer.get('id'),
                    },
                })
            } else {
                createCustomer({
                    integrationId: formState.store,
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        phone: formState.phone ? formState.phone : undefined,
                        email: formState.email,
                        address: formState.deliveryAddressChecked
                            ? {
                                  address1: formState.address,
                                  address2: formState.apartment,
                                  company: formState.company,
                                  city: formState.city,
                                  country_code: formState.countryCode,
                                  zip: formState.postalCode,
                                  province_code: formState.stateOrProvince,
                                  phone: formState.defaultAddressPhone || null,
                              }
                            : undefined,
                    },
                })
            }
        }
    }

    useEffect(() => {
        if (isUpdateCustomerSuccess || isCreateCustomerSuccess) {
            toast.dismiss(CUSTOMER_SYNC_TOAST_ID)
            handleSyncModalClose()
        }
    }, [isUpdateCustomerSuccess, isCreateCustomerSuccess, handleSyncModalClose])

    useEffect(() => {
        if (isUpdateCustomerLoading || isCreateCustomerLoading) {
            toast.info('Syncing profile to Shopify...', {
                id: CUSTOMER_SYNC_TOAST_ID,
                duration: Infinity,
            })
        }
    }, [isUpdateCustomerLoading, isCreateCustomerLoading])

    useEffect(() => {
        if (isUpdateCustomerError) {
            const message =
                updateCustomerError.status === 400 &&
                updateCustomerError?.message !== undefined
                    ? updateCustomerError.message
                    : 'There was an error syncing the customer'
            toast.error(message, {
                id: CUSTOMER_SYNC_TOAST_ID,
                duration: Infinity,
            })
        }
    }, [isUpdateCustomerError, updateCustomerError])

    useEffect(() => {
        if (isCreateCustomerError) {
            const message =
                createCustomerError.status === 400 &&
                createCustomerError?.message !== undefined
                    ? createCustomerError.message
                    : 'There was an error syncing the customer'
            toast.error(message, {
                id: CUSTOMER_SYNC_TOAST_ID,
                duration: Infinity,
            })
        }
    }, [isCreateCustomerError, createCustomerError])

    return (
        <Modal
            isOpen={isCustomerSyncFormOpen}
            classNameDialog={css.customerSyncForm}
            onClose={handleSyncModalClose}
        >
            <ModalHeader
                title={`Sync ${activeCustomer.get('name') as string} profile to Shopify`}
            />
            <form onSubmit={handleSyncCustomer}>
                <ModalBody>
                    <div className={css.formContainer}>
                        <ShopifyStoreSelect
                            shopifyStores={shopifyStores}
                            formState={formState}
                            onChange={onChange}
                            hasError={performedValidation && !formState.store}
                        />
                        <h3 className={css.contactInformation}>
                            Contact Information
                        </h3>
                        <span id="customer-email-wrapper">
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="sam.hopper@gmail.com"
                                isRequired
                                isDisabled={!isUpdateCustomer}
                                className={css.inputField}
                                value={formState.email}
                                onChange={(email) => onChange({ email })}
                                error={
                                    performedValidation && !formState.email
                                        ? 'Please enter a valid email address to sync this profile with Shopify. Syncing requires the customer’s email'
                                        : ''
                                }
                            />
                            <Tooltip
                                target="customer-email-wrapper"
                                disabled={isUpdateCustomer}
                            >
                                You can&apos;t change the email when creating a
                                new customer in Shopify
                            </Tooltip>
                        </span>

                        <TextField
                            name="name"
                            label="Name"
                            placeholder="Sam Hopper"
                            className={css.inputField}
                            value={formState.name}
                            onChange={(name) => onChange({ name })}
                        />

                        <PhoneNumberInput
                            name="phone"
                            label="Phone number"
                            placeholder="000-000-0000"
                            className={css.inputField}
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
