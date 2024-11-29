import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {useFlags} from 'launchdarkly-react-client-sdk'
import mapValues from 'lodash/mapValues'
import React, {useMemo} from 'react'

import {SubmitHandler} from 'react-hook-form'

import {useStore} from 'react-redux'
import {useHistory} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import Card from 'pages/settings/new_billing/components/Card'
import {Form} from 'pages/settings/new_billing/components/Form/Form'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {filterTaxIdsByAddress} from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
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

    const defaultValues = useDefaultValues(
        billingInformation,
        isStartingSubscription
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
                        <VerificationChargeDisclaimer />
                        {isStartingSubscription ? (
                            <BillingInformationFields />
                        ) : (
                            <FormSubmitButton>
                                {hasCreditCard
                                    ? 'Update card'
                                    : 'Add payment method'}
                            </FormSubmitButton>
                        )}
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
    isStartingSubscription: boolean
) => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    return useMemo(() => {
        let defaultValues: FormFields = {
            paymentMethod: {
                complete: false,
            },
        }

        if (isStartingSubscription) {
            defaultValues = {
                ...defaultValues,
                email: billingInformation.email,
                address: {
                    complete: false,
                    ...billingInformation.shipping,
                    address: {
                        ...billingInformation.shipping.address,
                        state: billingInformation.shipping.address.state ?? '',
                    },
                    phone: billingInformation.shipping.phone ?? undefined,
                },
            }

            if (isTaxIdFieldEnabled) {
                defaultValues = {
                    ...defaultValues,
                    ...mapValues(
                        billingInformation.tax_ids,
                        (taxId) => taxId?.value
                    ),
                }
            }
        }

        return defaultValues
    }, [billingInformation, isStartingSubscription, isTaxIdFieldEnabled])
}

const useHandleValidSubmit = (): SubmitHandler<FormFields> => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

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

            if (isTaxIdFieldEnabled) {
                payload.tax_ids = filterTaxIdsByAddress(
                    data,
                    data.address.address
                )
            }

            return submitPaymentMethodWithBillingContact(payload)
        }

        return submitPaymentMethod()
    }
}
