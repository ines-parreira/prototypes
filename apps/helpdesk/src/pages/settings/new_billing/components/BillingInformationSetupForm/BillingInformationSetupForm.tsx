import type React from 'react'
import { useMemo } from 'react'

import { BILLING_PAYMENT_PATH } from '@repo/billing'
import type { FormProps } from '@repo/forms'
import { Form } from '@repo/forms'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import mapValues from 'lodash/mapValues'
import type { SubmitHandler } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import { filterTaxIdsByAddress } from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
import { normalizeStateToCode } from 'pages/settings/new_billing/utils/normalizeStateToCode'
import { useSubmitBillingAddress } from 'pages/settings/new_billing/views/BillingAddressSetupView/hooks/useSubmitBillingAddress'
import type {
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

    const handleValidSubmit = useHandleValidSubmit({ onSuccess })

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
    return useMemo(() => {
        const defaultValues = {
            email: billingInformation.email,
            address: {
                complete: false,
                ...billingInformation.shipping,
                address: {
                    ...billingInformation.shipping?.address,
                    state:
                        normalizeStateToCode(
                            billingInformation.shipping?.address?.state,
                            billingInformation.shipping?.address?.country,
                        ) ?? undefined,
                },
                phone: billingInformation.shipping?.phone ?? undefined,
            },
        }

        return {
            ...defaultValues,
            ...mapValues(billingInformation.tax_ids, (taxId) => taxId?.value),
        }
    }, [billingInformation])
}

const useHandleValidSubmit = ({
    onSuccess,
}: {
    onSuccess?: () => void
}): SubmitHandler<FormFields> => {
    const history = useHistory()

    const submitBillingAddress = useSubmitBillingAddress({
        onSuccess:
            onSuccess ??
            (() => {
                history.push(BILLING_PAYMENT_PATH)
            }),
    })

    return ({ email, address: { complete: __, ...shipping }, ...taxIds }) => {
        logEvent(
            SegmentEvent.BillingPaymentInformationSaveBillingInformationClicked,
        )

        const payload: BillingContactUpdatePayload = {
            email,
            shipping,
        }

        payload.tax_ids = filterTaxIdsByAddress(taxIds, shipping.address)

        return submitBillingAddress.mutateAsync([payload])
    }
}
