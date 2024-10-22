import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import {useBillingContact} from 'models/billing/queries'
import {StripeElementsProvider} from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import {EmailInputField} from 'pages/settings/new_billing/components/EmailInputField/EmailInputField'
import {StripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/StripeAddressElement'
import {
    Form,
    IFormProps,
} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/Form/Form'
import {StripePaymentElement} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/StripePaymentElement'
import {VerificationChargeDisclaimer} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/VerificationChargeDisclaimer/VerificationChargeDisclaimer'
import {useHasCreditCard} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import {useSetupIntent} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSetupIntent'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import css from './PaymentMethodSetupView.less'

type IPaymentMethodSetupViewProps = Pick<
    IFormProps,
    'contactBilling' | 'dispatchBillingError'
>

export const PaymentMethodSetupView: React.FC<IPaymentMethodSetupViewProps> = ({
    contactBilling,
    dispatchBillingError,
}) => {
    const hasCreditCard = useHasCreditCard({refetchOnWindowFocus: false})
    const billingContact = useBillingContact({refetchOnWindowFocus: false})
    const setupIntent = useSetupIntent()

    if (
        setupIntent.isLoading ||
        hasCreditCard.isLoading ||
        billingContact.isLoading
    ) {
        return <Loader />
    }

    return (
        <StripeElementsProvider clientSecret={setupIntent.clientSecret}>
            <div className={css.container}>
                <BackLink />
                <Form
                    contactBilling={contactBilling}
                    dispatchBillingError={dispatchBillingError}
                >
                    <StripePaymentElement />
                    <VerificationChargeDisclaimer />
                    {!hasCreditCard.data ? (
                        <>
                            <h1 className={css.title}>Billing Information</h1>
                            <EmailInputField />
                            <StripeAddressElement />
                        </>
                    ) : null}
                </Form>
            </div>
        </StripeElementsProvider>
    )
}
