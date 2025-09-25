import { Link } from 'react-router-dom'

import { Tooltip, TooltipProps } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { Cadence } from 'models/billing/types'
import {
    getCadenceName,
    isLegacyAutomate,
    isOtherCadenceUpgrade,
} from 'models/billing/utils'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
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
}

export default function NavigateToChangeBillingFrequency({
    buttonText,
    tooltipPlacement,
    contactBilling,
}: NavigateToChangeBillingFrequencyProps) {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()
    const isScheduledToCancel = !!currentSubscription.get(
        'scheduled_to_cancel_at',
    )

    const isSubscribedToHelpdeskStarter =
        currentHelpdeskPlan?.name === 'Starter'
    const isSubscribedToVoiceOrSMS = !!currentVoicePlan || !!currentSmsPlan
    const isAAOLegacy =
        !!currentAutomatePlan && isLegacyAutomate(currentAutomatePlan)

    const cadence = currentHelpdeskPlan?.cadence ?? Cadence.Month
    const isCadenceUpgradable =
        Object.values(Cadence).find((other) =>
            isOtherCadenceUpgrade(cadence, other),
        ) !== undefined

    const isVettedForPhone = Boolean(
        currentSmsPlan?.plan_id && currentVoicePlan?.plan_id,
    )

    let toolTipContent

    if (isCadenceUpgradable) {
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
                        onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                    >
                        get in touch
                    </span>{' '}
                    with our team.
                </>
            )
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
        } else if (isSubscribedToVoiceOrSMS && !isVettedForPhone) {
            toolTipContent = (
                <>
                    To switch from {getCadenceName(Cadence.Month)} to{' '}
                    {getCadenceName(Cadence.Year)} billing, please{' '}
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
            return <Link to={BILLING_PAYMENT_FREQUENCY_PATH}>{buttonText}</Link>
        }
    } else {
        toolTipContent = (
            <>
                To switch from {getCadenceName(Cadence.Year)} to{' '}
                {getCadenceName(Cadence.Month)} billing, please{' '}
                <span
                    className={css.link}
                    onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
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
