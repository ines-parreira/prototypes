import React, {useEffect, useMemo} from 'react'
import {Link, useHistory} from 'react-router-dom'
import moment from 'moment'
import classNames from 'classnames'
import Tooltip from 'pages/common/components/Tooltip'
import {
    getCurrentSubscription,
    hasCreditCard as getHasCreditCard,
    isTrialing,
    shouldPayWithShopify as getShouldPayWithShopify,
} from 'state/currentAccount/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCurrentAutomateProduct,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
    getCurrentConvertProduct,
    getCurrentSMSProduct,
    getCurrentVoiceProduct,
} from 'state/billing/selectors'
import {ProductType} from 'models/billing/types'
import {
    BillingBanner,
    CurrentProductsUsages,
    TicketPurpose,
} from 'state/billing/types'
import BillingScheduledDowngrades from 'pages/settings/billing/BillingScheduledDowngrades'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {isAAOLegacyPrice} from 'models/billing/utils'
import useGetConvertStatus from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_FREQUENCY_PATH,
    BILLING_PROCESS_PATH,
    DATE_FORMAT,
    INTERVAL,
    PRODUCT_INFO,
} from '../../constants'
import ProductCard from '../../components/ProductCard'

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
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const convertProduct = useAppSelector(getCurrentConvertProduct)
    const automateProduct = useAppSelector(getCurrentAutomateProduct)
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const convertStatus = useGetConvertStatus()

    const isIntervalMonthly = interval === INTERVAL.Month
    const isSubscribedToHelpdeskStarter = helpdeskProduct?.name === 'Starter'
    const isSubscribedToVoiceOrSMS = !!voiceProduct || !!smsProduct

    const isTrialingSubscription = useAppSelector(isTrialing)
    const isAAOLegacy = !!automateProduct
        ? isAAOLegacyPrice(automateProduct, ProductType.Automation)
        : false
    const trialingStart = moment(
        currentSubscription.get('trial_start_datetime')
    )
    const trialingEnd = moment(currentSubscription.get('trial_end_datetime'))
    const trialPeriodStart = useMemo(
        () => trialingStart.format(DATE_FORMAT),
        [trialingStart]
    )

    const trialPeriodEnd = useMemo(
        () => trialingEnd.format(DATE_FORMAT),
        [trialingEnd]
    )

    const hasSubscription = useMemo(
        () => !currentSubscription.isEmpty(),
        [currentSubscription]
    )

    // in the last 3 days of the trial show banner
    const showTrialBanner = useMemo(() => {
        const now = moment()
        const diff = trialingEnd.diff(now, 'days')
        return diff <= 3 && diff >= 0
    }, [trialingEnd])

    const hasCreditCard = useAppSelector(getHasCreditCard)
    const shouldPayWithShopify = useAppSelector(getShouldPayWithShopify)

    useEffect(() => {
        if (isTrialingSubscription) {
            if (hasCreditCard) {
                const plan = helpdeskProduct?.name || ''
                const subscriptionStartDate = moment(trialPeriodEnd)
                    .add(1, 'day')
                    .format(DATE_FORMAT)

                const otherPlans = [
                    !!automateProduct &&
                        PRODUCT_INFO[ProductType.Automation].title,
                    !!voiceProduct && PRODUCT_INFO[ProductType.Voice].title,
                    !!smsProduct && PRODUCT_INFO[ProductType.SMS].title,
                ]
                    .filter(Boolean)
                    .join(', ')

                const CTA = (
                    <Link to={`${BILLING_PROCESS_PATH}/helpdesk`}>
                        Review Subscription
                    </Link>
                )

                void dispatch(
                    notify({
                        message: `Your subscription to the ${plan} plan ${
                            otherPlans.length > 0 ? `with ${otherPlans}` : ''
                        } starts on <b>${subscriptionStartDate}</b>.`,
                        allowHTML: true,
                        actionHTML: CTA,
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        id: 'trial-start-subscription',
                    })
                )
            } else if (showTrialBanner) {
                const cta = shouldPayWithShopify
                    ? `<a href=${ACTIVATE_PAYMENT_WITH_SHOPIFY_URL} target="_blank" rel="noopener noreferrer"> activate Billing with Shopify</a>`
                    : `<a href=${BILLING_PAYMENT_CARD_PATH}>add a payment method</a>`

                void dispatch(
                    notify({
                        message: `Your free trial is ending on ${trialPeriodEnd}. Please ${cta} to continue using Gorgias.`,
                        allowHTML: true,
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        id: 'trial-start-subscription',
                    })
                )
            }
        }
    }, [
        automateProduct,
        dispatch,
        hasCreditCard,
        shouldPayWithShopify,
        helpdeskProduct?.name,
        history,
        isTrialingSubscription,
        showTrialBanner,
        smsProduct,
        trialPeriodEnd,
        voiceProduct,
    ])

    return (
        <div className={css.container}>
            <div className={css.generalInfo}>
                <div className={css.generalInfoItem}>
                    {isTrialingSubscription ? (
                        <>
                            Your free trial started on{' '}
                            <span>{trialPeriodStart}</span> and will expire on{' '}
                            <span>{trialPeriodEnd}</span>
                        </>
                    ) : hasSubscription ? (
                        <>
                            Your subscription will be renewed on{' '}
                            <span>{periodEnd}</span>
                        </>
                    ) : (
                        <>
                            You don't have any active subscription. Please first
                            select some plans.
                        </>
                    )}
                </div>
                <div className={css.generalInfoItem}>
                    <span>
                        Billed {isIntervalMonthly ? <>monthly</> : <>yearly</>}
                    </span>
                    {isSubscribedToHelpdeskStarter ? (
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
                      interval === INTERVAL.Month ? (
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
                                            TicketPurpose.MONTHLY_TO_YEARLY
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
                                To change billing frequency, update Automation
                                to a non-legacy plan
                            </Tooltip>
                        </div>
                    ) : (
                        <Link to={BILLING_PAYMENT_FREQUENCY_PATH}>Update</Link>
                    )}
                </div>
            </div>
            <BillingScheduledDowngrades />
            <div className={css.productsGridContainer}>
                <ProductCard
                    type={ProductType.Helpdesk}
                    product={helpdeskProduct}
                    usage={currentUsage?.helpdesk}
                    banner={helpdeskBanner}
                    isDisabled={isSubscribedToHelpdeskStarter}
                />
                <ProductCard
                    type={ProductType.Automation}
                    product={automateProduct}
                    usage={currentUsage?.automation}
                    isDisabled={false}
                />
                <ProductCard
                    type={ProductType.Voice}
                    product={voiceProduct}
                    usage={currentUsage?.voice}
                    banner={voiceBanner}
                    isDisabled={false}
                />
                <ProductCard
                    type={ProductType.SMS}
                    product={smsProduct}
                    usage={currentUsage?.sms}
                    banner={smsBanner}
                    isDisabled={false}
                />
                <ProductCard
                    type={ProductType.Convert}
                    product={convertProduct}
                    usage={currentUsage?.convert}
                    banner={convertBanner}
                    isDisabled={false}
                    autoUpgradeEnabled={Boolean(
                        convertStatus && convertStatus.auto_upgrade_enabled
                    )}
                />
            </div>
            <div className={css.unsubscribe}>
                If you have any questions regarding your subscription, please{' '}
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
