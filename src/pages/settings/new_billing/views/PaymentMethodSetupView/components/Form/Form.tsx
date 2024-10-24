import React, {FormEventHandler, HTMLProps, useRef} from 'react'
import {useStore} from 'react-redux'
import {useHistory} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'
import Card from 'pages/settings/new_billing/components/Card'
import {useEmailInputField} from 'pages/settings/new_billing/components/EmailInputField/useEmailInputField'
import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {useStripePaymentElement} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/useStripePaymentElement'
import {
    ISubscriptionSummaryProps,
    SubscriptionSummary,
} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/SubscriptionSummary/SubscriptionSummary'
import {useSubmitPaymentMethodWithBillingContact} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethodWithBillingContact'
import {BillingContact} from 'state/billing/types'
import {
    getCurrentAccountState,
    getIsCurrentSubscriptionTrialingOrCanceled,
} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'

import css from './Form.less'

export type IFormProps = Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'ref'> &
    Pick<ISubscriptionSummaryProps, 'contactBilling' | 'dispatchBillingError'>

export const Form: React.FC<IFormProps> = ({
    children,
    contactBilling,
    dispatchBillingError,
    ...props
}) => {
    const history = useHistory()

    const store = useStore()

    const isStartingSubscription = useAppSelector(
        getIsCurrentSubscriptionTrialingOrCanceled
    )

    const formRef = useRef<HTMLFormElement>(null)

    const paymentElement = useStripePaymentElement()
    const addressElement = useStripeAddressElement()
    const emailField = useEmailInputField(formRef.current)

    const isAddressProvided = !!addressElement.getSelf()

    const isComplete =
        paymentElement.isComplete &&
        (!isAddressProvided ||
            (emailField.isComplete && addressElement.isComplete))

    const {
        submitPaymentMethodWithBillingContact,
        submitPaymentMethod,
        isLoading,
    } = useSubmitPaymentMethodWithBillingContact({
        onSuccess: () => {
            if (isStartingSubscription) {
                history.push(BILLING_BASE_PATH)
            }

            history.push(BILLING_PAYMENT_PATH)
        },
    })

    const handleSubmit = () => {
        const currentUser = getCurrentUser(store.getState())
        const currentAccount = getCurrentAccountState(store.getState())

        logEvent(SegmentEvent.PaymentMethodAddClicked, {
            payment_method: 'stripe',
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })

        if (isAddressProvided) {
            return submitPaymentMethodWithBillingContact({
                email: emailField.getValue(),
                shipping: addressElement.getValue(),
            } as BillingContact)
        }

        return submitPaymentMethod()
    }

    const handleSubmitForm: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault()
        void handleSubmit()
    }

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmitForm}
            className={css.form}
            {...props}
        >
            <Card title="Payment Method">
                <div className={css.container}>
                    {children}
                    <div>
                        {!isStartingSubscription && (
                            <Button
                                intent="primary"
                                isDisabled={!isComplete}
                                type="submit"
                                className={css.submitButton}
                                isLoading={isLoading}
                            >
                                {isAddressProvided
                                    ? 'Add payment method'
                                    : 'Update card'}
                            </Button>
                        )}
                        {addressElement.error ? (
                            <Caption error={addressElement.error} />
                        ) : null}
                    </div>
                </div>
            </Card>
            <SubscriptionSummary
                contactBilling={contactBilling}
                dispatchBillingError={dispatchBillingError}
                isPaymentMethodValid={isComplete}
                isSubmitting={isLoading}
                handleSubmit={handleSubmit}
            />
        </form>
    )
}
