import { useBillingContact } from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'
import { StripeElementsProvider } from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import { FormContainer } from 'pages/settings/new_billing/views/BillingAddressSetupView/components/FormContainer'

export const BillingAddressSetupView: React.FC = () => {
    const billingInformation = useBillingContact({
        refetchOnWindowFocus: false,
    })

    if (!billingInformation.data?.data) {
        return <Loader />
    }

    return (
        <StripeElementsProvider>
            <FormContainer billingInformation={billingInformation.data.data} />
        </StripeElementsProvider>
    )
}
