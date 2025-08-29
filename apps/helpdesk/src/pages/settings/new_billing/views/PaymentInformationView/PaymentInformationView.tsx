import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    AutomatePlan,
    Cadence,
    cadenceNames,
    HelpdeskPlan,
} from 'models/billing/types'
import { isLegacyAutomate } from 'models/billing/utils'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import { BillingInformationSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import { Description } from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import { Section } from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import { getCurrentHelpdeskCadence } from 'state/billing/selectors'
import { TicketPurpose } from 'state/billing/types'
import { shouldPayWithShopify as getShouldPayWithShopify } from 'state/currentAccount/selectors'

import { BILLING_PAYMENT_FREQUENCY_PATH } from '../../constants'

import css from './PaymentInformationView.less'

type PaymentInformationViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    currentHelpdeskPlan?: HelpdeskPlan
    currentAutomatePlan?: AutomatePlan
    isCurrentSubscriptionCanceled: boolean
}

const PaymentInformationView = ({
    contactBilling,
    currentHelpdeskPlan,
    currentAutomatePlan,
    isCurrentSubscriptionCanceled,
}: PaymentInformationViewProps) => {
    const cadence = useAppSelector(getCurrentHelpdeskCadence) ?? Cadence.Month
    const isSubscribedToHelpdeskStarter =
        currentHelpdeskPlan?.name === 'Starter'
    const isAAOLegacy =
        !!currentAutomatePlan && isLegacyAutomate(currentAutomatePlan)

    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

    const changeCadence = useMemo(() => {
        let toolTipContent

        if (cadence === Cadence.Month) {
            if (isSubscribedToHelpdeskStarter) {
                toolTipContent =
                    'To change billing frequency, upgrade your Helpdesk plan to Basic or higher'
            } else if (isAAOLegacy) {
                toolTipContent =
                    'To change billing frequency, update AI Agent to a non-legacy plan'
            } else if (isCurrentSubscriptionCanceled) {
                toolTipContent = (
                    <>
                        Your subscription is cancelled. To reactivate, please{' '}
                        <span
                            className={css.link}
                            onClick={() =>
                                contactBilling(TicketPurpose.CONTACT_US)
                            }
                        >
                            contact us
                        </span>
                        .
                    </>
                )
            } else {
                return (
                    <Link to={BILLING_PAYMENT_FREQUENCY_PATH}>
                        Change Frequency
                    </Link>
                )
            }
        } else {
            toolTipContent = (
                <>
                    To switch from {cadenceNames[Cadence.Year]} to{' '}
                    {cadenceNames[Cadence.Month]} billing, please{' '}
                    <span
                        className={css.link}
                        onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                    >
                        get in touch
                    </span>{' '}
                    with our Billing team.
                </>
            )
        }

        return (
            <>
                <div className={css.disabledText} id="change-frequency">
                    Change Frequency
                </div>
                <Tooltip
                    target="change-frequency"
                    placement="bottom-start"
                    className={css.tooltip}
                    autohide={false}
                >
                    {toolTipContent}
                </Tooltip>
            </>
        )
    }, [
        cadence,
        isSubscribedToHelpdeskStarter,
        isAAOLegacy,
        isCurrentSubscriptionCanceled,
        contactBilling,
    ])

    return (
        <div className={css.container}>
            <Section icon="credit_card" title="Payment method">
                <NewSummaryPaymentSection
                    className={css.summaryPaymentSection}
                />
            </Section>
            <Section icon="history" title="Billing frequency">
                <Description>
                    All plans are billed <strong>{cadence}ly</strong>
                </Description>
                {changeCadence}
            </Section>
            {!shouldPayWithShopify ? <BillingInformationSection /> : null}
        </div>
    )
}

export default PaymentInformationView
