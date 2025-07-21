import { useBillingContact } from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'
import { StripeElementsProvider } from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import { FormContainer } from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/FormContainer/FormContainer'
import { useHasCreditCard } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import { useSetupIntent } from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSetupIntent'

type IProps = {
    dispatchBillingError: (error: unknown) => void
}

export const PaymentMethodSetupView: React.FC<IProps> = ({
    dispatchBillingError,
}) => {
    const hasCreditCard = useHasCreditCard()
    const billingInformation = useBillingContact({
        refetchOnWindowFocus: false,
    })
    const setupIntent = useSetupIntent()

    if (
        !setupIntent.clientSecret ||
        hasCreditCard.isLoading ||
        !billingInformation.data?.data
    ) {
        return <Loader />
    }

    return (
        <StripeElementsProvider clientSecret={setupIntent.clientSecret}>
            <FormContainer
                hasCreditCard={hasCreditCard.data}
                billingInformation={billingInformation.data.data}
                dispatchBillingError={dispatchBillingError}
            />
        </StripeElementsProvider>
    )
}
