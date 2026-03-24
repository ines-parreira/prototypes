import { useCallback, useEffect, useMemo, useState } from 'react'

import type { SelectedPlans } from '@repo/billing'
import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_INTERNAL_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_FREQUENCY_PATH,
    BILLING_PAYMENT_PATH,
    BILLING_PAYMENTS_HISTORY_PATH,
    BILLING_PROCESS_PATH,
    BILLING_SUPPORT_EMAIL,
    DATE_FORMAT,
    SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
    ZAPIER_BILLING_HOOK,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useSessionStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'
import moment from 'moment'
import { NavLink, Redirect, Route, Switch } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useProductsUsage } from 'models/billing/queries'
import { isEnterprise } from 'models/billing/utils'
import { AlertType } from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import useGetConvertStatus, {
    BundleOnboardingStatus,
    UsageStatus,
} from 'pages/convert/common/hooks/useGetConvertStatus'
import { isExceedingPlanLimit } from 'pages/convert/common/utils/isExceedingPlanLimit'
import { PaymentMethodSetupView } from 'pages/settings/new_billing/views/PaymentMethodSetupView/PaymentMethodSetupView'
import {
    getCurrentConvertPlan,
    getIsCurrentHelpdeskLegacy,
} from 'state/billing/selectors'
import type { BillingBanner } from 'state/billing/types'
import { TicketPurpose } from 'state/billing/types'
import {
    getCurrentAccountState,
    getCurrentSubscription,
    paymentMethod as getPaymentMethodSelector,
    isTrialing,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import ContactSupportModal from '../../components/ContactSupportModal/ContactSupportModal'
import useDispatchBillingError from '../../hooks/useDispatchBillingError'
import { useUrlNotification } from '../../hooks/useUrlNotification'
import { BillingAddressSetupView } from '../BillingAddressSetupView/BillingAddressSetupView'
import BillingFrequencyView from '../BillingFrequencyView'
import BillingInternalView from '../BillingInternalView'
import { BillingProcessView } from '../BillingProcessView'
import PaymentsHistoryView from '../PaymentHistoryView'
import PaymentInformationView from '../PaymentInformationView/PaymentInformationView'
import UsageAndPlansView from '../UsageAndPlansView'

import css from './BillingStartView.less'

const BillingStartView = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const payment = useAppSelector(getPaymentMethodSelector)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()

    // Parallel data fetching with React Query
    const { data: currentUsage, isLoading: isUsageLoading } = useProductsUsage()

    const isLoading = isUsageLoading

    const subscriptionStartDatetime = currentSubscription
        ? moment(currentSubscription.get('start_datetime'))
        : null
    const now = moment()
    const isCurrentSubscriptionNew = subscriptionStartDatetime
        ? now.diff(subscriptionStartDatetime, 'hours') < 24
        : false
    const voiceBannerInstanceId = subscriptionStartDatetime
        ? `voice-subscription-activated-${subscriptionStartDatetime.toISOString()}`
        : null
    const smsBannerInstanceId = subscriptionStartDatetime
        ? `sms-subscription-activated-${subscriptionStartDatetime.toISOString()}`
        : null

    const [, setSessionSelectedPlans] = useSessionStorage<SelectedPlans>(
        SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
    )

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.LongDateWithYear,
    )

    const convertStatus = useGetConvertStatus()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [subject, setSubject] = useState(
        `New Billing support request - ${domain}`,
    )
    const [defaultMessage, setDefaultMessage] = useState('')
    const [ticketPurpose, setTicketPurpose] = useState<TicketPurpose>(
        TicketPurpose.CONTACT_US,
    )
    const periodEnd = useMemo(
        () =>
            moment(
                currentUsage?.helpdesk?.meta.subscription_end_datetime ||
                    new Date(),
            ).format(DATE_FORMAT),
        [currentUsage],
    )

    const [helpdeskBanner, setHelpdeskBanner] = useState<BillingBanner>()
    const [voiceBanner, setVoiceBanner] = useState<BillingBanner>()
    const [smsBanner, setSMSBanner] = useState<BillingBanner>()
    const [convertBanner, setConvertBanner] = useState<BillingBanner>()

    const { addBanner, removeBanner } = useBanners()

    useUrlNotification()

    const contactBilling = useCallback(
        (ticketPurpose: TicketPurpose) => {
            setSubject(`New Billing support request - ${domain}`)
            setDefaultMessage('')
            setIsModalOpen(true)
            setTicketPurpose(ticketPurpose)
        },
        [domain],
    )

    const dispatchBillingError = useDispatchBillingError(contactBilling)

    useEffect(() => {
        if (isCurrentHelpdeskLegacy) {
            setHelpdeskBanner({
                description: (
                    <>
                        You are subscribed to a legacy plan that expires on{' '}
                        <b>{periodEnd}</b>
                        {` and you'll need to update your plan.`}
                    </>
                ),
                type: AlertType.Error,
            })
        }

        if (voiceBannerInstanceId) {
            if (currentUsage?.voice) {
                if (isCurrentSubscriptionNew) {
                    setVoiceBanner({
                        description: 'Get started with your Voice plan',
                        type: AlertType.Info,
                    })

                    addBanner({
                        instanceId: voiceBannerInstanceId,
                        category: BannerCategories.BILLING,
                        type: AlertBannerTypes.Info,
                        message: 'Your Voice subscription has been activated!',
                        CTA: {
                            type: 'external',
                            href: 'https://docs.gorgias.com/en-US/set-up-voice-81798',
                            text: 'Set Up Voice',
                        },
                    })
                } else {
                    removeBanner(
                        BannerCategories.BILLING,
                        voiceBannerInstanceId,
                    )
                }
            }
        }
        if (smsBannerInstanceId) {
            if (currentUsage?.sms) {
                if (isCurrentSubscriptionNew) {
                    setSMSBanner({
                        description: 'Get started with your SMS plan',
                        type: AlertType.Info,
                    })

                    addBanner({
                        instanceId: smsBannerInstanceId,
                        category: BannerCategories.BILLING,
                        type: AlertBannerTypes.Info,
                        message: 'Your SMS subscription has been activated!',
                        CTA: {
                            type: 'external',
                            href: 'https://docs.gorgias.com/en-US/set-up-sms-81919',
                            text: 'Set Up SMS',
                        },
                    })
                } else {
                    removeBanner(BannerCategories.BILLING, smsBannerInstanceId)
                }
            }
        }
    }, [
        addBanner,
        currentUsage,
        isCurrentHelpdeskLegacy,
        periodEnd,
        removeBanner,
        voiceBannerInstanceId,
        smsBannerInstanceId,
        isCurrentSubscriptionNew,
    ])

    /* istanbul ignore next */
    useEffect(() => {
        if (currentConvertPlan && convertStatus) {
            let enterpriseCta = <></>
            if (isEnterprise(currentConvertPlan)) {
                enterpriseCta = (
                    <b>
                        <a href="mailto:billing@gorgias.com" rel="noreferrer">
                            Contact us to upgrade
                        </a>
                    </b>
                )
            }

            const convertSubscriptionBannerInstanceId = `convert-subscription-activated-${'enterpriseCta'}`

            if (
                convertStatus.bundle_status ===
                BundleOnboardingStatus.NOT_INSTALLED
            ) {
                setConvertBanner({
                    description: 'Get started with your Convert plan',
                    type: AlertType.Info,
                })

                addBanner({
                    instanceId: convertSubscriptionBannerInstanceId,
                    message: 'Your Convert subscription has been activated!',
                    type: AlertBannerTypes.Info,
                    category: BannerCategories.BILLING,
                    CTA: {
                        type: 'internal',
                        to: '/app/convert',
                        text: 'Set Up Convert',
                    },
                })
            } else if (
                convertStatus.usage_status === UsageStatus.LIMIT_REACHED
            ) {
                setConvertBanner({
                    description: (
                        <>
                            {`You've reached the limit for your Convert. As a
                            result, your campaigns are currently on hold.`}
                            {`Upgrade now to bring them back to your website.`}{' '}
                            {enterpriseCta}
                        </>
                    ),
                    type: AlertType.Error,
                })
                removeBanner(
                    BannerCategories.BILLING,
                    convertSubscriptionBannerInstanceId,
                )
            } else if (
                convertStatus.estimated_reach_date &&
                isExceedingPlanLimit(convertStatus)
            ) {
                const estimatedDate = formatDatetime(
                    convertStatus.estimated_reach_date,
                    datetimeFormat,
                ).toString()
                if (convertStatus.auto_upgrade_enabled) {
                    setConvertBanner({
                        description: (
                            <>
                                You are likely to reach your allowance on{' '}
                                {estimatedDate}, and you will be auto-upgraded.{' '}
                                {enterpriseCta}
                            </>
                        ),
                        type: AlertType.Warning,
                    })
                } else {
                    setConvertBanner({
                        description: (
                            <>
                                You are likely to reach your allowance on{' '}
                                {estimatedDate}, and campaigns will stop being
                                displayed. {enterpriseCta}
                            </>
                        ),
                        type: AlertType.Warning,
                    })
                }
                removeBanner(
                    BannerCategories.BILLING,
                    convertSubscriptionBannerInstanceId,
                )
            } else {
                // hide banner
                setConvertBanner(undefined)
                removeBanner(
                    BannerCategories.BILLING,
                    convertSubscriptionBannerInstanceId,
                )
            }
        }
        // trigger useEffect only when convertProduct is changed or status was fetched
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConvertPlan, convertStatus])

    if (
        useFlag(FeatureFlagKey.BillingMaintenanceMode) &&
        !window.USER_IMPERSONATED
    ) {
        return (
            <div className={css.mainContainer}>
                <h1>Billing maintenance in progress</h1>
                We&apos;re performing a scheduled update to our billing system.
                This should be completed within a few hours. If you have any
                urgent requests, please contact our{' '}
                <a
                    href="mailto:billing@gorgias.com"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Billing Support team
                </a>
                .
            </div>
        )
    }

    return (
        <div className="full-width">
            <PageHeader title="Billing" />
            {
                <SecondaryNavbar>
                    {/* Only show the 'Gorgias Internal' tab when user is impersonated */}
                    {window.USER_IMPERSONATED ? (
                        <NavLink to={BILLING_INTERNAL_PATH}>
                            Gorgias Internal
                        </NavLink>
                    ) : null}
                    <NavLink
                        to={BILLING_BASE_PATH}
                        isActive={(match, location) => {
                            if (!match) {
                                return false
                            }

                            return (
                                location.pathname === BILLING_BASE_PATH ||
                                location.pathname.includes(BILLING_PROCESS_PATH)
                            )
                        }}
                    >
                        Usage & Plans
                    </NavLink>
                    {/* Hide the 'Payment Information' tab when no active subscription, so that customer first select a plan before setting a payment method*/}
                    {isCurrentSubscriptionCanceled ? null : (
                        <NavLink
                            to={BILLING_PAYMENT_PATH}
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.BillingPaymentInformationTabClicked,
                                )
                            }}
                        >
                            Payment Information
                        </NavLink>
                    )}
                    <NavLink
                        to={BILLING_PAYMENTS_HISTORY_PATH}
                        onClick={() => {
                            logEvent(
                                SegmentEvent.BillingPaymentHistoryTabClicked,
                            )
                        }}
                    >
                        Payment History
                    </NavLink>
                </SecondaryNavbar>
            }
            <div className={css.mainContainer}>
                {isLoading ? (
                    <Loader />
                ) : (
                    <Switch>
                        <Route exact path={BILLING_INTERNAL_PATH}>
                            {window.USER_IMPERSONATED ? (
                                <BillingInternalView />
                            ) : (
                                <div>You cannot access this page</div>
                            )}
                        </Route>
                        <Route exact path={BILLING_BASE_PATH}>
                            <UsageAndPlansView
                                contactBilling={contactBilling}
                                periodEnd={periodEnd}
                                currentUsage={currentUsage}
                                voiceBanner={voiceBanner}
                                smsBanner={smsBanner}
                                convertBanner={convertBanner}
                                helpdeskBanner={helpdeskBanner}
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_PATH}>
                            <PaymentInformationView
                                contactBilling={contactBilling}
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENTS_HISTORY_PATH}>
                            <PaymentsHistoryView />
                        </Route>
                        <Route
                            path={`${BILLING_PROCESS_PATH}/:selectedProduct`}
                        >
                            <BillingProcessView
                                setIsModalOpen={setIsModalOpen}
                                contactBilling={contactBilling}
                                setDefaultMessage={setDefaultMessage}
                                dispatchBillingError={dispatchBillingError}
                                isTrialing={isTrialingSubscription}
                                isCurrentSubscriptionCanceled={
                                    isCurrentSubscriptionCanceled
                                }
                                periodEnd={periodEnd}
                                currentUsage={currentUsage}
                                setSessionSelectedPlans={
                                    setSessionSelectedPlans
                                }
                            />
                        </Route>
                        <Route exact path={BILLING_INFORMATION_PATH}>
                            <BillingAddressSetupView />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_FREQUENCY_PATH}>
                            <BillingFrequencyView
                                contactBilling={contactBilling}
                                dispatchBillingError={dispatchBillingError}
                                periodEnd={periodEnd}
                                isTrialing={isTrialingSubscription}
                                isCurrentSubscriptionCanceled={
                                    isCurrentSubscriptionCanceled
                                }
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_CARD_PATH}>
                            {payment === 'shopify' ? (
                                <Redirect to={BILLING_PAYMENT_PATH} />
                            ) : (
                                <PaymentMethodSetupView
                                    dispatchBillingError={dispatchBillingError}
                                />
                            )}
                        </Route>
                    </Switch>
                )}
            </div>
            <ContactSupportModal
                isOpen={isModalOpen}
                handleOnClose={() => {
                    setIsModalOpen(false)
                }}
                ticketPurpose={ticketPurpose}
                subject={subject}
                from={from}
                domain={domain}
                defaultMessage={defaultMessage}
                to={BILLING_SUPPORT_EMAIL}
                zapierHook={ZAPIER_BILLING_HOOK}
            />
        </div>
    )
}

export default BillingStartView
