import {Tooltip} from '@gorgias/merchant-ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    AutomatePlan,
    HelpdeskPlan,
    PlanInterval,
    SMSOrVoicePlan,
} from 'models/billing/types'
import {isLegacyAutomate} from 'models/billing/utils'
import {BillingInformationSection} from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import {Description} from 'pages/settings/new_billing/views/PaymentInformationView/components/Description'
import {Section} from 'pages/settings/new_billing/views/PaymentInformationView/components/Section'
import {fetchCreditCard} from 'state/billing/actions'
import {creditCard, getCurrentHelpdeskInterval} from 'state/billing/selectors'
import {TicketPurpose} from 'state/billing/types'
import {shouldPayWithShopify as getShouldPayWithShopify} from 'state/currentAccount/selectors'

import SummaryPaymentSection from '../../components/SummaryPaymentSection/SummaryPaymentSection'
import {BILLING_PAYMENT_FREQUENCY_PATH} from '../../constants'
import css from './PaymentInformationView.less'

type PaymentInformationViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    currentHelpdeskPlan?: HelpdeskPlan
    currentAutomatePlan?: AutomatePlan
    currentVoicePlan?: SMSOrVoicePlan
    currentSmsPlan?: SMSOrVoicePlan
    isCurrentSubscriptionCanceled: boolean
}

const PaymentInformationView = ({
    contactBilling,
    currentHelpdeskPlan,
    currentAutomatePlan,
    currentVoicePlan,
    currentSmsPlan,
    isCurrentSubscriptionCanceled,
}: PaymentInformationViewProps) => {
    const dispatch = useAppDispatch()

    const interval =
        useAppSelector(getCurrentHelpdeskInterval) ?? PlanInterval.Month
    const isSubscribedToHelpdeskStarter =
        currentHelpdeskPlan?.name === 'Starter'
    const isAAOLegacy =
        !!currentAutomatePlan && isLegacyAutomate(currentAutomatePlan)
    const isSubscribedToVoiceOrSms = !!currentVoicePlan || !!currentSmsPlan
    const phoneSelfServeEnabled =
        useFlags()[FeatureFlagKey.BillingVoiceSmsSelfServe]

    const card = useAppSelector(creditCard)
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            if (!card.get('brand')) {
                await dispatch(fetchCreditCard())
            }
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [card, dispatch])

    const changeFrequency = useMemo(() => {
        let toolTipContent

        if (interval === PlanInterval.Month) {
            if (isSubscribedToHelpdeskStarter) {
                toolTipContent =
                    'To change billing frequency, upgrade your Helpdesk plan to Basic or higher'
            } else if (isAAOLegacy) {
                toolTipContent =
                    'To change billing frequency, update Automate to a non-legacy plan'
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
            } else if (isSubscribedToVoiceOrSms && !phoneSelfServeEnabled) {
                toolTipContent = (
                    <>
                        To switch from monthly to yearly,{' '}
                        <span
                            className={css.link}
                            onClick={() =>
                                contactBilling(TicketPurpose.MONTHLY_TO_YEARLY)
                            }
                        >
                            get in touch
                        </span>{' '}
                        with our team.
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
                    To switch from yearly to monthly billing, please{' '}
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
        interval,
        isSubscribedToHelpdeskStarter,
        isAAOLegacy,
        isSubscribedToVoiceOrSms,
        isCurrentSubscriptionCanceled,
        contactBilling,
        phoneSelfServeEnabled,
    ])

    return (
        <div className={css.container}>
            <Section icon="credit_card" title="Payment method">
                <SummaryPaymentSection
                    isCreditCardFetched={isCreditCardFetched}
                    isPaymentInformationView
                />
            </Section>
            <Section icon="history" title="Billing frequency">
                <Description>
                    All plans are billed <strong>{interval}ly</strong>
                </Description>
                {changeFrequency}
            </Section>
            {!shouldPayWithShopify ? <BillingInformationSection /> : null}
        </div>
    )
}

export default PaymentInformationView
