import { useEffect, useMemo } from 'react'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAUSED_TOOLTIP,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PROCESS_PATH,
    DATE_FORMAT,
    PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'

import { AlertBannerTypes } from 'AlertBanners'
import { useBillingState } from 'billing/hooks/useBillingState'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import {
    generatePaymentPlanLabel,
    getProductInfo,
    isYearlyContractPlan,
} from 'models/billing/utils'
import useMeetAiAgentNotifications from 'pages/aiAgent/hooks/useMeetAiAgentNotification'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import BillingScheduledDowngrades from 'pages/settings/new_billing/components/BillingScheduledDowngrades/BillingScheduledDowngrades'
import { ShopifyBillingInactiveBanner } from 'pages/settings/new_billing/components/ShopifyBillingInactiveBanner'
import {
    getCurrentAutomatePlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
} from 'state/billing/selectors'
import type { BillingBanner, CurrentProductsUsages } from 'state/billing/types'
import { TicketPurpose } from 'state/billing/types'
import {
    getCurrentSubscription,
    hasCreditCard as getHasCreditCard,
    shouldPayWithShopify as getShouldPayWithShopify,
    isTrialing,
} from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStyle } from 'state/notifications/types'

import NavigateToChangeBillingFrequency from '../../components/NavigateToChangeBillingFrequency/NavigateToChangeBillingFrequency'
import ProductCard from '../../components/ProductCard'
import useProductCancellations from '../../hooks/useProductCancellations'
import { CustomPlanBanner } from './CustomPlanBanner'

import css from './UsageAndPlansView.less'

type UsageAndPlansViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    periodEnd: string
    currentUsage?: CurrentProductsUsages
    convertBanner?: BillingBanner
    voiceBanner?: BillingBanner
    smsBanner?: BillingBanner
    helpdeskBanner?: BillingBanner
}

function getDisabledTooltip(
    isBillingPaused: boolean,
    isTrialingSubscription: boolean,
) {
    if (isBillingPaused) {
        return BILLING_PAUSED_TOOLTIP
    }
    if (isTrialingSubscription) {
        return PRODUCT_DISABLED_FOR_TRIALING_USERS_TOOLTIP
    }
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
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const convertStatus = useGetConvertStatus()

    const { pathname } = useLocation()

    const billingState = useBillingState()
    const isBillingPaused = !!billingState.data?.subscription.is_paused
    const isTrialingSubscription = useAppSelector(isTrialing)
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

    const subscripingDisabledForUser: boolean = !!useFlag(
        FeatureFlagKey.BillingPreventSubscriptionAnyPlan,
    )

    const disabledTooltip = getDisabledTooltip(
        isBillingPaused,
        isTrialingSubscription,
    )

    const productCancellationsQuery = useProductCancellations()
    const isLoading = productCancellationsQuery.isLoading
    const cancellationsByPlanId = productCancellationsQuery.data ?? new Map()

    useEffect(() => {
        if (isTrialingSubscription) {
            if (hasCreditCard) {
                const helpdeskPlanName = currentHelpdeskPlan?.name || ''
                const subscriptionStartDate = moment(trialPeriodEnd)
                    .add(1, 'day')
                    .format(DATE_FORMAT)

                const otherPlans = [
                    !!currentAutomatePlan &&
                        getProductInfo(
                            ProductType.Automation,
                            currentAutomatePlan,
                        ).title,
                    !!currentVoicePlan &&
                        getProductInfo(ProductType.Voice, currentVoicePlan)
                            .title,
                    !!currentSmsPlan &&
                        getProductInfo(ProductType.SMS, currentSmsPlan).title,
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

    useEffectOnce(() => {
        logEvent(SegmentEvent.BillingUsageAndPlansVisited, { url: pathname })
    })

    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)

    return (
        <div className={css.container}>
            <ShopifyBillingInactiveBanner />
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

                {hasSubscription ? (
                    <div className={css.generalInfoItem}>
                        <span>
                            {generatePaymentPlanLabel(currentHelpdeskPlan)}
                        </span>

                        <NavigateToChangeBillingFrequency
                            buttonText="Update"
                            tooltipPlacement="top"
                            contactBilling={contactBilling}
                            trackingEvent={
                                SegmentEvent.BillingUsageAndPlansChangeFrequencyClicked
                            }
                            cancellationsByPlanId={cancellationsByPlanId}
                        />
                    </div>
                ) : null}
            </div>
            {isCurrentSubscriptionCanceled ? null : (
                <BillingScheduledDowngrades />
            )}
            {hasSubscription && isYearlyPlan && (
                <CustomPlanBanner
                    contactUsCallback={() =>
                        contactBilling(TicketPurpose.CONTACT_US)
                    }
                />
            )}

            {subscripingDisabledForUser ? null : (
                <div className={css.productsGridContainer}>
                    <ProductCard
                        type={ProductType.Helpdesk}
                        plan={currentHelpdeskPlan}
                        usage={currentUsage?.helpdesk}
                        banner={helpdeskBanner}
                        tooltipDisabledCTACallback={contactBilling}
                        isDisabled={
                            isBillingPaused ||
                            (!currentHelpdeskPlan && !!scheduledToCancelAt)
                        }
                        disabledTooltip={disabledTooltip}
                        scheduledToCancelAt={
                            currentHelpdeskPlan
                                ? scheduledToCancelAt || null
                                : null
                        }
                    />
                    <ProductCard
                        type={ProductType.Automation}
                        plan={currentAutomatePlan}
                        usage={currentUsage?.automation}
                        isDisabled={
                            isBillingPaused ||
                            (!currentAutomatePlan && !!scheduledToCancelAt)
                        }
                        disabledTooltip={disabledTooltip}
                        tooltipDisabledCTACallback={contactBilling}
                        scheduledToCancelAt={
                            currentAutomatePlan
                                ? scheduledToCancelAt ||
                                  cancellationsByPlanId.get(
                                      currentAutomatePlan.plan_id,
                                  ) ||
                                  null
                                : null
                        }
                        isLoading={isLoading}
                    />
                    <ProductCard
                        type={ProductType.Voice}
                        plan={currentVoicePlan}
                        usage={currentUsage?.voice}
                        banner={voiceBanner}
                        tooltipDisabledCTACallback={contactBilling}
                        isDisabled={
                            isBillingPaused ||
                            (!currentVoicePlan && !!scheduledToCancelAt) ||
                            isTrialingSubscription
                        }
                        disabledTooltip={disabledTooltip}
                        scheduledToCancelAt={
                            currentVoicePlan
                                ? scheduledToCancelAt ||
                                  cancellationsByPlanId.get(
                                      currentVoicePlan.plan_id,
                                  ) ||
                                  null
                                : null
                        }
                        isLoading={isLoading}
                    />
                    <ProductCard
                        type={ProductType.SMS}
                        plan={currentSmsPlan}
                        usage={currentUsage?.sms}
                        banner={smsBanner}
                        tooltipDisabledCTACallback={contactBilling}
                        isDisabled={
                            isBillingPaused ||
                            (!currentSmsPlan && !!scheduledToCancelAt) ||
                            isTrialingSubscription
                        }
                        disabledTooltip={disabledTooltip}
                        scheduledToCancelAt={
                            currentSmsPlan
                                ? scheduledToCancelAt ||
                                  cancellationsByPlanId.get(
                                      currentSmsPlan.plan_id,
                                  ) ||
                                  null
                                : null
                        }
                        isLoading={isLoading}
                    />
                    <ProductCard
                        type={ProductType.Convert}
                        plan={currentConvertPlan}
                        usage={currentUsage?.convert}
                        banner={convertBanner}
                        tooltipDisabledCTACallback={contactBilling}
                        isDisabled={
                            isBillingPaused ||
                            (!currentConvertPlan && !!scheduledToCancelAt)
                        }
                        disabledTooltip={disabledTooltip}
                        autoUpgradeEnabled={Boolean(
                            convertStatus && convertStatus.auto_upgrade_enabled,
                        )}
                        scheduledToCancelAt={
                            currentConvertPlan
                                ? scheduledToCancelAt ||
                                  cancellationsByPlanId.get(
                                      currentConvertPlan.plan_id,
                                  ) ||
                                  null
                                : null
                        }
                        isLoading={isLoading}
                    />
                </div>
            )}
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
