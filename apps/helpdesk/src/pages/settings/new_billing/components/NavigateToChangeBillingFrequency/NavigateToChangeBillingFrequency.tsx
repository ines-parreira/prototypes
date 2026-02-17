import { logEvent } from '@repo/logging'
import type { SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import type { LegacyTooltipProps as TooltipProps } from '@gorgias/axiom'
import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { Cadence } from 'models/billing/types'
import type { PlanId } from 'models/billing/types'
import {
    isLegacyAutomate,
    isOtherCadenceUpgrade,
    isYearlyContractPlan,
} from 'models/billing/utils'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { TicketPurpose } from 'state/billing/types'
import { getCurrentSubscription } from 'state/currentAccount/selectors'

import { BILLING_PAYMENT_FREQUENCY_PATH } from '../../constants'

import css from './NavigateToChangeBillingFrequency.less'

export type ContactBillingCallback = (ticketPurpose: TicketPurpose) => void

export type NavigateToChangeBillingFrequencyProps = {
    buttonText: string
    tooltipPlacement: TooltipProps['placement']
    contactBilling: ContactBillingCallback
    trackingEvent: SegmentEvent
    cancellationsByPlanId?: Map<PlanId, string>
}

export default function NavigateToChangeBillingFrequency({
    buttonText,
    tooltipPlacement,
    contactBilling,
    trackingEvent,
    cancellationsByPlanId,
}: NavigateToChangeBillingFrequencyProps) {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()
    const isScheduledToCancel = !!currentSubscription.get(
        'scheduled_to_cancel_at',
    )

    const isSubscribedToHelpdeskStarter =
        currentHelpdeskPlan?.name === 'Starter'
    const isAAOLegacy =
        !!currentAutomatePlan && isLegacyAutomate(currentAutomatePlan)

    const cadence = currentHelpdeskPlan?.cadence ?? Cadence.Year
    const isCadenceUpgradable =
        Object.values(Cadence).find((other) =>
            isOtherCadenceUpgrade(cadence, other),
        ) !== undefined

    let toolTipContent
    if (isCadenceUpgradable) {
        if (isSubscribedToHelpdeskStarter) {
            toolTipContent =
                'To change billing frequency, upgrade your Helpdesk plan to Basic or higher'
        } else if (isAAOLegacy) {
            toolTipContent =
                'To change billing frequency, update AI Agent to a non-legacy plan'
        } else if (isScheduledToCancel) {
            toolTipContent = (
                <>
                    Your subscription is scheduled to cancel. To reactivate,
                    please{' '}
                    <span
                        className={css.link}
                        onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                    >
                        get in touch
                    </span>{' '}
                    with our team.
                </>
            )
        } else if (cancellationsByPlanId && cancellationsByPlanId.size > 0) {
            toolTipContent = (
                <>
                    Some products are scheduled to cancel. To change your
                    billing frequency or keep your products active, please{' '}
                    <span
                        className={css.link}
                        onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                    >
                        get in touch
                    </span>{' '}
                    with our team.
                </>
            )
        } else {
            return (
                <Link
                    to={BILLING_PAYMENT_FREQUENCY_PATH}
                    onClick={() => {
                        logEvent(trackingEvent)
                    }}
                >
                    {buttonText}
                </Link>
            )
        }
    } else if (isCurrentSubscriptionCanceled) {
        toolTipContent = (
            <>
                Your subscription is cancelled. To reactivate, please{' '}
                <span
                    className={css.link}
                    onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                >
                    get in touch
                </span>{' '}
                with our team.
            </>
        )
    } else if (isYearlyContractPlan(currentHelpdeskPlan)) {
        toolTipContent = (
            <>
                Because you&apos;re on a custom plan, please{' '}
                <span
                    className={css.link}
                    onClick={() =>
                        contactBilling(
                            TicketPurpose.BILLING_FREQUENCY_DOWNGRADE,
                        )
                    }
                >
                    contact our team
                </span>{' '}
                to make changes.
            </>
        )
    } else {
        toolTipContent = (
            <>
                To downgrade billing frequency, please{' '}
                <span
                    className={css.link}
                    onClick={() =>
                        contactBilling(
                            TicketPurpose.BILLING_FREQUENCY_DOWNGRADE,
                        )
                    }
                >
                    get in touch
                </span>{' '}
                with our team.
            </>
        )
    }

    return (
        <>
            <div className={css.disabledText} id="update-billing-frequency">
                {buttonText}
            </div>
            {toolTipContent ? (
                <Tooltip
                    target="update-billing-frequency"
                    placement={tooltipPlacement}
                    className={css.tooltip}
                    autohide={false}
                >
                    {toolTipContent}
                </Tooltip>
            ) : null}
        </>
    )
}
