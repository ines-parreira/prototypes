import React, { useEffect, useMemo } from 'react'

import classNames from 'classnames'
import moment from 'moment'
import { Link, useHistory } from 'react-router-dom'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { AlertBannerTypes } from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Cadence, ProductType } from 'models/billing/types'
import { isLegacyAutomate } from 'models/billing/utils'
import useMeetAiAgentNotifications from 'pages/aiAgent/hooks/useMeetAiAgentNotification'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import BillingScheduledDowngrades from 'pages/settings/new_billing/components/BillingScheduledDowngrades/BillingScheduledDowngrades'
import {
    getCurrentAutomatePlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
} from 'state/billing/selectors'
import {
    BillingBanner,
    CurrentProductsUsages,
    TicketPurpose,
} from 'state/billing/types'
import {
    getCurrentSubscription,
    hasCreditCard as getHasCreditCard,
    shouldPayWithShopify as getShouldPayWithShopify,
    isTrialing,
} from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStyle } from 'state/notifications/types'

import ProductCard from '../../components/ProductCard'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_FREQUENCY_PATH,
    BILLING_PROCESS_PATH,
    DATE_FORMAT,
    PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
    PRODUCT_INFO,
} from '../../constants'

import css from './UsageAndPlansView.less'

type UsageAndPlansViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    periodEnd: string
    currentUsage: CurrentProductsUsages | null
    convertBanner?: BillingBanner
    voiceBanner?: BillingBanner
    smsBanner?: BillingBanner
    helpdeskBanner?: BillingBanner
}

const UsageAndPlansView = ({
    contactBilling,
    periodEnd,
    currentUsage,
    convertBanner,
    smsBanner,
    voiceBanner,
    helpdeskBanner,
}: UsageAndPlansViewProps) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const convertStatus = useGetConvertStatus()

    const isCurrentPlanMonthly = cadence === Cadence.Month
    const isCurrentPlanYearly = cadence === Cadence.Year
    const isSubscribedToHelpdeskStarter =
        currentHelpdeskPlan?.name === 'Starter'
    const isSubscribedToVoiceOrSMS = !!currentVoicePlan || !!currentSmsPlan

    const isTrialingSubscription = useAppSelector(isTrialing)
    const isAAOLegacy = !!currentAutomatePlan
        ? isLegacyAutomate(currentAutomatePlan)
        : false
    const trialingStart = moment(
        currentSubscription.get('trial_start_datetime'),
    )
    const trialingEnd = moment(currentSubscription.get('trial_end_datetime'))
    const trialPeriodStart = useMemo(
        () => trialingStart.format(DATE_FORMAT),
        [trialingStart],
    )

    const trialPeriodEnd = useMemo(
        () => trialingEnd.format(DATE_FORMAT),
        [trialingEnd],
    )

    const hasSubscription = useMemo(
        () => !currentSubscription.isEmpty(),
        [currentSubscription],
    )
    const scheduledToCancelAt = currentSubscription.get(
        'scheduled_to_cancel_at',
    )
    // in the last 3 days of the trial show banner
    const showTrialBanner = useMemo(() => {
        const now = moment()
        const diff = trialingEnd.diff(now, 'days')
        return diff <= 3 && diff >= 0
    }, [trialingEnd])

    const hasCreditCard = useAppSelector(getHasCreditCard)
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

    const disabledTooltip = isTrialingSubscription
        ? PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP
        : undefined

    const isVettedForPhone = Boolean(
        currentSmsPlan?.price_id || currentVoicePlan?.price_id,
    )

    useEffect(() => {
        if (isTrialingSubscription) {
            if (hasCreditCard) {
                const helpdeskPlanName = currentHelpdeskPlan?.name || ''
                const subscriptionStartDate = moment(trialPeriodEnd)
                    .add(1, 'day')
                    .format(DATE_FORMAT)

                const otherPlans = [
                    !!currentAutomatePlan &&
                        PRODUCT_INFO[ProductType.Automation].title,
                    !!currentVoicePlan && PRODUCT_INFO[ProductType.Voice].title,
                    !!currentSmsPlan && PRODUCT_INFO[ProductType.SMS].title,
                ]
                    .filter(Boolean)
                    .join(', ')

                void dispatch(
                    notify({
                        style: NotificationStyle.Banner,
                        type: AlertBannerTypes.Warning,
                        message: `Your subscription to the ${helpdeskPlanName} plan ${
                            otherPlans.length > 0 ? `with ${otherPlans}` : ''
                        } starts on <b>${subscriptionStartDate}</b>.`,
                        CTA: {
                            type: 'internal',
                            to: `${BILLING_PROCESS_PATH}/helpdesk`,
                            text: 'Review Subscription',
                        },
                        id: 'trial-start-subscription',
                    }),
                )
            } else if (showTrialBanner) {
                const CTA = {
                    type: 'internal' as const,
                    ...(shouldPayWithShopify
                        ? {
                              to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                              text: 'Activate Billing with Shopify',
                              openInNewTab: true,
                          }
                        : {
                              to: BILLING_PAYMENT_CARD_PATH,
                              text: 'Add a payment method',
                          }),
                }

                void dispatch(
                    notify({
                        id: 'trial-start-subscription',
                        style: NotificationStyle.Banner,
                        type: AlertBannerTypes.Warning,
                        CTA,
                        message: `Your free trial is ending on ${trialPeriodEnd}.`,
                    }),
                )
            }
        }
    }, [
        currentAutomatePlan,
        dispatch,
        hasCreditCard,
        shouldPayWithShopify,
        currentHelpdeskPlan?.name,
        history,
        isTrialingSubscription,
        showTrialBanner,
        currentSmsPlan,
        trialPeriodEnd,
        currentVoicePlan,
    ])

    useMeetAiAgentNotifications()

    return (
        <div className={css.container}>
            <div className={css.generalInfo}>
                <div className={css.generalInfoItem}>
                    {isTrialingSubscription ? (
                        <div>
                            Your free trial started on{' '}
                            <span>{trialPeriodStart}</span> and will expire on{' '}
                            <span>{trialPeriodEnd}</span>
                        </div>
                    ) : !!scheduledToCancelAt ? (
                        <div>
                            Your Helpdesk subscription has been cancelled. It
                            will remain active until the end of your billing
                            cycle on{' '}
                            <span>
                                {moment(scheduledToCancelAt).format(
                                    DATE_FORMAT,
                                )}
                            </span>
                            .
                        </div>
                    ) : hasSubscription ? (
                        <div>
                            All your active subscription(s) will renew on{' '}
                            <span>{periodEnd}</span>.
                        </div>
                    ) : (
                        <>{`You don't have any active subscriptions.`}</>
                    )}
                </div>
                <div className={css.generalInfoItem}>
                    <span>
                        Billed{' '}
                        {isCurrentPlanMonthly ||
                        isCurrentSubscriptionCanceled ? (
                            <>monthly</>
                        ) : (
                            <>yearly</>
                        )}
                    </span>
                    {isCurrentSubscriptionCanceled ? null : isSubscribedToHelpdeskStarter ? (
                        <div>
                            <span
                                className={css.disabledText}
                                id="update-billing-frequency"
                            >
                                Update
                            </span>
                            <Tooltip
                                target="update-billing-frequency"
                                placement="top"
                                className={css.tooltip}
                                autohide={false}
                            >
                                To change billing frequency, upgrade your
                                Helpdesk plan to Basic or higher
                            </Tooltip>
                        </div>
                    ) : isSubscribedToVoiceOrSMS &&
                      isCurrentPlanMonthly &&
                      !isVettedForPhone ? (
                        <div>
                            <span
                                className={css.disabledText}
                                id="update-billing-frequency"
                            >
                                Update
                            </span>
                            <Tooltip
                                target="update-billing-frequency"
                                placement="top"
                                className={css.tooltip}
                                autohide={false}
                            >
                                To switch from monthly to yearly,{' '}
                                <span
                                    className={css.link}
                                    onClick={() =>
                                        contactBilling(
                                            TicketPurpose.MONTHLY_TO_YEARLY,
                                        )
                                    }
                                >
                                    get in touch
                                </span>{' '}
                                with our team.
                            </Tooltip>
                        </div>
                    ) : isAAOLegacy ? (
                        <div>
                            <span
                                className={css.disabledText}
                                id="update-billing-frequency"
                            >
                                Update
                            </span>
                            <Tooltip
                                target="update-billing-frequency"
                                placement="top"
                                className={css.tooltip}
                                autohide={false}
                            >
                                To change billing frequency, update Automate to
                                a non-legacy plan
                            </Tooltip>
                        </div>
                    ) : !!scheduledToCancelAt || isCurrentPlanYearly ? (
                        // downgrading from yearly to monthly is not possible
                        <span
                            className={css.disabledText}
                            id="update-billing-frequency"
                        >
                            Update
                        </span>
                    ) : (
                        <Link to={BILLING_PAYMENT_FREQUENCY_PATH}>Update</Link>
                    )}
                </div>
            </div>
            {isCurrentSubscriptionCanceled ? null : (
                <BillingScheduledDowngrades />
            )}
            <div className={css.productsGridContainer}>
                <ProductCard
                    type={ProductType.Helpdesk}
                    plan={currentHelpdeskPlan}
                    usage={currentUsage?.helpdesk}
                    banner={helpdeskBanner}
                    isDisabled={
                        isSubscribedToHelpdeskStarter ||
                        (!currentHelpdeskPlan && !!scheduledToCancelAt)
                    }
                />
                <ProductCard
                    type={ProductType.Automation}
                    plan={currentAutomatePlan}
                    usage={currentUsage?.automation}
                    isDisabled={!currentAutomatePlan && !!scheduledToCancelAt}
                />
                <ProductCard
                    type={ProductType.Voice}
                    plan={currentVoicePlan}
                    usage={currentUsage?.voice}
                    banner={voiceBanner}
                    isDisabled={
                        (!currentVoicePlan && !!scheduledToCancelAt) ||
                        isTrialingSubscription
                    }
                    disabledTooltip={disabledTooltip}
                />
                <ProductCard
                    type={ProductType.SMS}
                    plan={currentSmsPlan}
                    usage={currentUsage?.sms}
                    banner={smsBanner}
                    isDisabled={
                        (!currentSmsPlan && !!scheduledToCancelAt) ||
                        isTrialingSubscription
                    }
                    disabledTooltip={disabledTooltip}
                />
                <ProductCard
                    type={ProductType.Convert}
                    plan={currentConvertPlan}
                    usage={currentUsage?.convert}
                    banner={convertBanner}
                    isDisabled={!currentConvertPlan && !!scheduledToCancelAt}
                    autoUpgradeEnabled={Boolean(
                        convertStatus && convertStatus.auto_upgrade_enabled,
                    )}
                />
            </div>
            <div className={css.unsubscribe}>
                If you have any questions, please{' '}
                <span
                    className={classNames('text-primary', css.contactUs)}
                    onClick={() => contactBilling(TicketPurpose.CONTACT_US)}
                >
                    contact us
                </span>
                .
            </div>
            <div
                className={css.canduContainer}
                data-candu-id="billing-main-content"
            ></div>
        </div>
    )
}

export default UsageAndPlansView
