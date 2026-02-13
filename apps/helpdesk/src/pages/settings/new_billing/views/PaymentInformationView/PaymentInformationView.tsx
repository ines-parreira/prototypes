import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useLocation } from 'react-router'

import useAppSelector from 'hooks/useAppSelector'
import { Cadence } from 'models/billing/types'
import { getCadenceName, isYearlyContractPlan } from 'models/billing/utils'
import { ShopifyBillingInactiveBanner } from 'pages/settings/new_billing/components/ShopifyBillingInactiveBanner'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import useProductCancellations from 'pages/settings/new_billing/hooks/useProductCancellations'
import { BillingInformationSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import { BPOPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BPOPartnerSection'
import { ConsultingAgencyPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/ConsultingAgencyPartnerSection'
import { Description } from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import { Section } from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import { CustomPlanBanner } from 'pages/settings/new_billing/views/UsageAndPlansView/CustomPlanBanner'
import {
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { TicketPurpose } from 'state/billing/types'
import { shouldPayWithShopify as getShouldPayWithShopify } from 'state/currentAccount/selectors'

import NavigateToChangeBillingFrequency from '../../components/NavigateToChangeBillingFrequency/NavigateToChangeBillingFrequency'

import css from './PaymentInformationView.less'

export type PaymentInformationViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
}

const PaymentInformationView = ({
    contactBilling,
}: PaymentInformationViewProps) => {
    const cadence = useAppSelector(getCurrentHelpdeskCadence) ?? Cadence.Month
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)
    const { pathname } = useLocation()
    const productCancellationsQuery = useProductCancellations()
    const cancellationsByPlanId = productCancellationsQuery.data ?? new Map()
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)

    useEffectOnce(() => {
        logEvent(SegmentEvent.BillingPaymentInformationTabVisited, {
            url: pathname,
        })
    })

    return (
        <div className={css.container}>
            <ShopifyBillingInactiveBanner />
            {isYearlyPlan && (
                <CustomPlanBanner
                    contactUsCallback={() =>
                        contactBilling(TicketPurpose.CONTACT_US)
                    }
                />
            )}
            <Section icon="credit_card" title="Payment method">
                <NewSummaryPaymentSection
                    className={css.summaryPaymentSection}
                    trackingSource="payment_method"
                />
            </Section>
            <Section icon="history" title="Billing frequency">
                <Description>
                    All plans are billed{' '}
                    <strong>{getCadenceName(cadence).toLowerCase()}</strong>
                </Description>
                <NavigateToChangeBillingFrequency
                    buttonText="Change Frequency"
                    tooltipPlacement="bottom-start"
                    contactBilling={contactBilling}
                    trackingEvent={
                        SegmentEvent.BillingPaymentInformationChangeFrequencyClicked
                    }
                    cancellationsByPlanId={cancellationsByPlanId}
                />
            </Section>
            {!shouldPayWithShopify ? <BillingInformationSection /> : null}
            <ConsultingAgencyPartnerSection />
            <BPOPartnerSection />
        </div>
    )
}

export default PaymentInformationView
