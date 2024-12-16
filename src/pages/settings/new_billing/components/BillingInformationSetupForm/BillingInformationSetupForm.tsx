import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {useFlags} from 'launchdarkly-react-client-sdk'
import mapValues from 'lodash/mapValues'
import React, {useMemo} from 'react'

import {SubmitHandler} from 'react-hook-form'

import {useHistory} from 'react-router-dom'

import {Form, type FormProps} from 'components/Form/Form'
import {FeatureFlagKey} from 'config/featureFlags'

import {BILLING_PAYMENT_PATH} from 'pages/settings/new_billing/constants'
import {filterTaxIdsByAddress} from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
import {useSubmitBillingAddress} from 'pages/settings/new_billing/views/BillingAddressSetupView/hooks/useSubmitBillingAddress'
import {
    BillingContactDetailResponse,
    BillingContactUpdatePayload,
} from 'state/billing/types'

import css from './BillingInformationSetupForm.less'

type FormFields = {
    email: string
    address: {
        complete: boolean
    } & StripeAddressElementChangeEvent['value']
} & BillingContactUpdatePayload['tax_ids']

type Props = Omit<
    FormProps<FormFields>,
    'onValidSubmit' | 'defaultValues' | 'className'
> & {
    billingInformation: BillingContactDetailResponse
    onSuccess?: () => void
}

export const BillingInformationSetupForm = ({
    billingInformation,
    onSuccess,
    children,
    ...props
}: React.PropsWithChildren<Props>) => {
    const defaultValues = useDefaultValues(billingInformation)

    const handleValidSubmit = useHandleValidSubmit({onSuccess})

    return (
        <Form
            {...props}
            onValidSubmit={handleValidSubmit}
            defaultValues={defaultValues}
            className={css.container}
        >
            {children}
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

const useHandleValidSubmit = ({
    onSuccess,
}: {
    onSuccess?: () => void
}): SubmitHandler<FormFields> => {
    const history = useHistory()
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    const submitBillingAddress = useSubmitBillingAddress({
        onSuccess:
            onSuccess ??
            (() => {
                history.push(BILLING_PAYMENT_PATH)
            }),
    })

    return ({email, address: {complete: __, ...shipping}, ...taxIds}) => {
        const payload: BillingContactUpdatePayload = {
            email,
            shipping,
        }

        if (isTaxIdFieldEnabled) {
            payload.tax_ids = filterTaxIdsByAddress(taxIds, shipping.address)
        }

        return submitBillingAddress.mutateAsync([payload])
    }
}
