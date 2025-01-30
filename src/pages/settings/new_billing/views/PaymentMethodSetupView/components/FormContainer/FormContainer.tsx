import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import mapValues from 'lodash/mapValues'
import React, {useMemo} from 'react'

import {SubmitHandler} from 'react-hook-form'

import {useStore} from 'react-redux'
import {useHistory} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {Form} from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import {StripePaymentMethodType} from 'models/billing/types'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import Card from 'pages/settings/new_billing/components/Card'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {useStripeElementPaymentState} from 'pages/settings/new_billing/hooks/useStripeElementPaymentState'
import {filterTaxIdsByAddress} from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
import {getIsMissingBillingtInformation} from 'pages/settings/new_billing/utils/getIsMissingBillingtInformation'
import {StripePaymentFields} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentFields/StripePaymentFields'
import {
    ISubscriptionSummaryProps,
    SubscriptionSummary,
} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/SubscriptionSummary/SubscriptionSummary'
import {VerificationChargeDisclaimer} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/VerificationChargeDisclaimer/VerificationChargeDisclaimer'

import {useSubmitPaymentMethodWithBillingContact} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethodWithBillingContact'
import {
    BillingContactDetailResponse,
    BillingContactUpdatePayload,
} from 'state/billing/types'
import {
    getCurrentAccountState,
    getIsCurrentSubscriptionTrialingOrCanceled,
} from 'state/currentAccount/selectors'

import {getCurrentUser} from 'state/currentUser/selectors'

import css from './FormContainer.less'

export type FormFields = {
    paymentMethod: {
        complete: boolean
    }
    email?: string
    address?: {
        complete: boolean
    } & StripeAddressElementChangeEvent['value']
} & BillingContactUpdatePayload['tax_ids']

export const FormContainer: React.FC<
    {
        hasCreditCard: boolean
        billingInformation: BillingContactDetailResponse
    } & Pick<ISubscriptionSummaryProps<FormFields>, 'dispatchBillingError'>
> = ({hasCreditCard, billingInformation, dispatchBillingError}) => {
    const isStartingSubscription = useAppSelector(
        getIsCurrentSubscriptionTrialingOrCanceled
    )
    const selectedPaymentMethodType = useStripeElementPaymentState(
        (event) => event.value.type
    ) as Maybe<StripePaymentMethodType>

    const shouldDisplayBillingInformationFields =
        getIsMissingBillingtInformation(billingInformation)

    const defaultValues = useDefaultValues(
        billingInformation,
        shouldDisplayBillingInformationFields
    )

    const handleValidSubmit = useHandleValidSubmit()

    return (
        <Form
            className={css.form}
            defaultValues={defaultValues}
            onValidSubmit={handleValidSubmit}
        >
            <BackLink />
            <div className={css.cards}>
                <Card title="Payment Method">
                    <div className={css.cardContent}>
                        <StripePaymentFields />
                        {selectedPaymentMethodType === 'card' ||
                        selectedPaymentMethodType === null ? (
                            <VerificationChargeDisclaimer />
                        ) : null}
                        {shouldDisplayBillingInformationFields ? (
                            <BillingInformationFields />
                        ) : null}
                        {!isStartingSubscription ? (
                            <FormSubmitButton className={css.submitButton}>
                                {hasCreditCard
                                    ? 'Update payment method'
                                    : 'Add payment method'}
                            </FormSubmitButton>
                        ) : null}
                    </div>
                </Card>
                <SubscriptionSummary
                    dispatchBillingError={dispatchBillingError}
                    onValidSubmit={handleValidSubmit}
                />
            </div>
        </Form>
    )
}

const useDefaultValues = (
    billingInformation: BillingContactDetailResponse,
    shouldDisplayBillingInformationFields: boolean
) => {
    return useMemo(() => {
        const baseValues: FormFields = {
            paymentMethod: {
                complete: false,
            },
        }

        if (!shouldDisplayBillingInformationFields) {
            return baseValues
        }

        const withBillingInfo: FormFields = {
            ...baseValues,
            email: billingInformation.email,
            address: {
                complete: false,
                ...billingInformation.shipping,
                address: {
                    ...billingInformation.shipping?.address,
                    state: billingInformation.shipping?.address?.state ?? '',
                },
                phone: billingInformation.shipping?.phone ?? undefined,
            },
        }

        const withTaxIds: FormFields = {
            ...withBillingInfo,
            ...mapValues(billingInformation.tax_ids, (taxId) => taxId?.value),
        }

        return withTaxIds
    }, [billingInformation, shouldDisplayBillingInformationFields])
}

const useHandleValidSubmit = (): SubmitHandler<FormFields> => {
    const history = useHistory()
    const store = useStore()

    const {submitPaymentMethodWithBillingContact, submitPaymentMethod} =
        useSubmitPaymentMethodWithBillingContact({
            onSuccess: () => {
                const isStartingSubscription =
                    getIsCurrentSubscriptionTrialingOrCanceled(store.getState())

                if (isStartingSubscription) {
                    history.push(BILLING_BASE_PATH)
                } else {
                    history.push(BILLING_PAYMENT_PATH)
                }
            },
        })

    return (data) => {
        const currentUser = getCurrentUser(store.getState())
        const currentAccount = getCurrentAccountState(store.getState())

        logEvent(SegmentEvent.PaymentMethodAddClicked, {
            payment_method: 'stripe',
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })

        if (data.email && data.address) {
            const payload: BillingContactUpdatePayload = {
                email: data.email,
                shipping: data.address,
            }

            payload.tax_ids = filterTaxIdsByAddress(data, data.address.address)

            return submitPaymentMethodWithBillingContact(payload)
        }

        return submitPaymentMethod()
    }
}
