import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {useFlags} from 'launchdarkly-react-client-sdk'
import mapValues from 'lodash/mapValues'
import React, {useMemo} from 'react'

import {SubmitHandler} from 'react-hook-form'

import {Form} from 'components/Form/Form'
import {FeatureFlagKey} from 'config/featureFlags'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'

import {filterTaxIdsByAddress} from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
import {useSubmitBillingAddress} from 'pages/settings/new_billing/views/BillingAddressSetupView/hooks/useSubmitBillingAddress'
import {
    BillingContactDetailResponse,
    BillingContactUpdatePayload,
} from 'state/billing/types'

import css from './FormContainer.less'

type FormFields = {
    email: string
    address: {
        complete: boolean
    } & StripeAddressElementChangeEvent['value']
} & BillingContactUpdatePayload['tax_ids']

export const FormContainer: React.FC<{
    billingInformation: BillingContactDetailResponse
}> = ({billingInformation}) => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    const defaultValues = useDefaultValues(billingInformation)

    const handleValidSubmit = useHandleValidSubmit()

    return (
        <Form
            onValidSubmit={handleValidSubmit}
            defaultValues={defaultValues}
            className={css.container}
        >
            <BackLink />
            <div className={css.container}>
                <BillingInformationFields />
            </div>
            <FormSubmitButton>
                {isTaxIdFieldEnabled
                    ? 'Save Billing Information'
                    : 'Set Address'}
            </FormSubmitButton>
        </Form>
    )
}

const useDefaultValues = (billingInformation: BillingContactDetailResponse) => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    return useMemo(() => {
        const defaultValues = {
            email: billingInformation.email,
            address: {
                complete: false,
                ...billingInformation.shipping,
                phone: billingInformation.shipping.phone ?? undefined,
            },
        }

        if (isTaxIdFieldEnabled) {
            return {
                ...defaultValues,
                ...mapValues(
                    billingInformation.tax_ids,
                    (taxId) => taxId?.value
                ),
            }
        }

        return defaultValues
    }, [billingInformation, isTaxIdFieldEnabled])
}

const useHandleValidSubmit = (): SubmitHandler<FormFields> => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    const submitBillingAddress = useSubmitBillingAddress()

    return ({email, address, ...taxIds}) => {
        const payload: BillingContactUpdatePayload = {
            email,
            shipping: address,
        }

        if (isTaxIdFieldEnabled) {
            payload.tax_ids = filterTaxIdsByAddress(taxIds, address.address)
        }

        return submitBillingAddress.mutateAsync([payload])
    }
}
