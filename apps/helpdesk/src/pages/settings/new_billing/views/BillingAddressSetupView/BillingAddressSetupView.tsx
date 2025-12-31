import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useLocation } from 'react-router'

import { useBillingContact } from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'
import { StripeElementsProvider } from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import { FormContainer } from 'pages/settings/new_billing/views/BillingAddressSetupView/components/FormContainer'

export const BillingAddressSetupView: React.FC = () => {
    const { pathname } = useLocation()
    const billingInformation = useBillingContact({
        refetchOnWindowFocus: false,
    })

    useEffectOnce(() => {
        logEvent(
            SegmentEvent.BillingPaymentInformationBillingInformationVisited,
            {
                url: pathname,
            },
        )
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
