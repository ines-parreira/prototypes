import useAppSelector from 'hooks/useAppSelector'
import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { BillingInformationSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import { BPOPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BPOPartnerSection'
import { ConsultingAgencyPartnerSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/ConsultingAgencyPartnerSection'
import { Description } from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import { Section } from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import { getCurrentHelpdeskCadence } from 'state/billing/selectors'
import type { TicketPurpose } from 'state/billing/types'
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

    return (
        <div className={css.container}>
            <Section icon="credit_card" title="Payment method">
                <NewSummaryPaymentSection
                    className={css.summaryPaymentSection}
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
                />
            </Section>
            {!shouldPayWithShopify ? <BillingInformationSection /> : null}
            <ConsultingAgencyPartnerSection />
            <BPOPartnerSection />
        </div>
    )
}

export default PaymentInformationView
