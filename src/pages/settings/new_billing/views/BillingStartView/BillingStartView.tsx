import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {NavLink, Redirect, Route, Switch} from 'react-router-dom'
import moment from 'moment'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {BillingBanner, TicketPurpose} from 'state/billing/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCurrentAccountState,
    getCurrentSubscription,
    isTrialing,
    paymentMethod,
} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getCurrentAutomationProduct,
    getCurrentConvertProduct,
    getCurrentHelpdeskProduct,
    getCurrentProductsUsage,
    getCurrentSMSProduct,
    getCurrentVoiceProduct,
    getIsCurrentHelpdeskLegacy,
} from 'state/billing/selectors'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {
    fetchCurrentProductsUsage,
    fetchPaymentMethod,
} from 'state/billing/actions'
import Loader from 'pages/common/components/Loader/Loader'
import {AlertType} from 'pages/common/components/Alert/Alert'
import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENTS_HISTORY_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_FREQUENCY_PATH,
    BILLING_PAYMENT_PATH,
    BILLING_PROCESS_PATH,
    BILLING_SUPPORT_EMAIL,
    DATE_FORMAT,
    ZAPIER_BILLING_HOOK,
} from '../../constants'
import UsageAndPlansView from '../UsageAndPlansView'
import PaymentInformationView from '../PaymentInformationView/PaymentInformationView'
import PaymentsHistoryView from '../PaymentHistoryView'
import BillingProcessView from '../BillingProcessView'
import BillingInformationView from '../BillingInformationView'
import BillingFrequencyView from '../BillingFrequencyView'
import ContactSupportModal from '../../components/ContactSupportModal/ContactSupportModal'
import PaymentMethodView from '../PaymentMethodView/PaymentMethodView'
import useGetConvertStatus, {
    BundleOnboardingStatus,
    UsageStatus,
} from '../../../revenue/hooks/useGetConvertStatus'
import {useIsConvertCampaignCappingEnabled} from '../../../revenue/hooks/useIsConvertCampaignCappingEnabled'
import css from './BillingStartView.less'

const BillingStartView = () => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const currentUsage = useAppSelector(getCurrentProductsUsage)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const automationProduct = useAppSelector(getCurrentAutomationProduct)
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const convertProduct = useAppSelector(getCurrentConvertProduct)
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const payment = useAppSelector(paymentMethod)
    const isPaymentShopify = payment === 'shopify'
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isCurrentSubscriptionCanceled = currentSubscription.isEmpty()
    const isConvertCampaignCappingEnabled = useIsConvertCampaignCappingEnabled()

    const convertStatus = useGetConvertStatus()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [subject, setSubject] = useState(
        `New Billing support request - ${domain}`
    )
    const [defaultMessage, setDefaultMessage] = useState('')
    const [ticketPurpose, setTicketPurpose] = useState<TicketPurpose>(
        TicketPurpose.CONTACT_US
    )
    const [isUsageFetched, setIsUsageFetched] = useState(false)
    const periodEnd = useMemo(
        () =>
            moment(
                currentUsage?.helpdesk?.meta.subscription_end_datetime ||
                    new Date()
            ).format(DATE_FORMAT),
        [currentUsage]
    )
    const [helpdeskBanner, setHelpdeskBanner] = useState<BillingBanner>()
    const [voiceBanner, setVoiceBanner] = useState<BillingBanner>()
    const [smsBanner, setSMSBanner] = useState<BillingBanner>()
    const [convertBanner, setConvertBanner] = useState<BillingBanner>()

    const contactBilling = useCallback(
        (ticketPurpose: TicketPurpose) => {
            setSubject(`New Billing support request - ${domain}`)
            setDefaultMessage('')
            setIsModalOpen(true)
            setTicketPurpose(ticketPurpose)
        },
        [domain]
    )

    const billingErrorNotification: Notification = useMemo(
        () => ({
            message: `We couldn't update your subscription. Please try again.`,
            buttons: [
                {
                    primary: false,
                    name: 'Contact Billing',
                    onClick: () => contactBilling(TicketPurpose.ERROR),
                },
            ],
            noAutoDismiss: true,
            showDismissButton: true,
            status: NotificationStatus.Error,
            id: 'billing-error-notification',
        }),
        [contactBilling]
    )

    const dispatchBillingError = useCallback(() => {
        void dispatch(notify(billingErrorNotification))
    }, [billingErrorNotification, dispatch])

    const prepareMessage = useCallback(
        (message: string) => {
            switch (ticketPurpose) {
                case TicketPurpose.ENTERPRISE:
                    return [
                        `Billing request: Enterprise subscription`,
                        `Merchant Helpdesk plan: ${
                            helpdeskProduct?.name ?? ''
                        }`,
                        `Free trial: ${
                            isTrialingSubscription ? 'true' : 'false'
                        }`,
                        `Request:`,
                        message,
                    ].join('\n')
                case TicketPurpose.ERROR:
                    return [
                        `Billing request: Billing error`,
                        `Request:`,
                        message,
                    ].join('\n')
                case TicketPurpose.MONTHLY_TO_YEARLY:
                    return [
                        `Billing request: Subscription change from Monthly to Yearly with Voice/SMS`,
                        `Request:`,
                        message,
                    ].join('\n')
                case TicketPurpose.CONTACT_US:
                default:
                    return [
                        `Billing request: General request from Billing page`,
                        `Request:`,
                        message,
                    ].join('\n')
            }
        },
        [helpdeskProduct?.name, isTrialingSubscription, ticketPurpose]
    )

    useEffect(() => {
        const fetchUsage = async () => {
            await dispatch(fetchCurrentProductsUsage())
            await dispatch(fetchPaymentMethod())
            setIsUsageFetched(true)
        }

        if (!currentUsage) {
            void fetchUsage()
        } else {
            setIsUsageFetched(true)
        }
    }, [currentUsage, dispatch])

    useEffect(() => {
        if (isCurrentHelpdeskLegacy) {
            setHelpdeskBanner({
                description: (
                    <>
                        You are subscribed to a legacy plan that expires on{' '}
                        <b>{periodEnd}</b> and you'll need to update your plan.
                    </>
                ),
                type: AlertType.Error,
            })
        }
        if (currentUsage?.voice) {
            const subscriptionStartDate = moment(
                currentUsage.voice.meta.subscription_start_datetime
            )
            const now = moment()
            const isSubscriptionNew =
                now.diff(subscriptionStartDate, 'hours') < 24

            if (isSubscriptionNew) {
                setVoiceBanner({
                    description: 'Get started with your Voice plan',
                    type: AlertType.Info,
                })
                void dispatch(
                    notify({
                        message: `Your Voice subscription has been activated!`,
                        style: NotificationStyle.Banner,
                        status: NotificationStatus.Success,
                        actionHTML: (
                            <a
                                href="https://docs.gorgias.com/en-US/set-up-voice-81798"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Set Up Voice
                            </a>
                        ),
                    })
                )
            }
        }
        if (currentUsage?.sms) {
            const subscriptionStartDate = moment(
                currentUsage.sms.meta.subscription_start_datetime
            )
            const now = moment()
            const isSubscriptionNew =
                now.diff(subscriptionStartDate, 'hours') < 24

            if (isSubscriptionNew) {
                setSMSBanner({
                    description: 'Get started with your SMS plan',
                    type: AlertType.Info,
                })
                void dispatch(
                    notify({
                        message: `Your SMS subscription has been activated!`,
                        style: NotificationStyle.Banner,
                        status: NotificationStatus.Success,
                        actionHTML: (
                            <a
                                href="https://docs.gorgias.com/en-US/set-up-sms-81919"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Set Up SMS
                            </a>
                        ),
                    })
                )
            }
        }
    }, [currentUsage, dispatch, isCurrentHelpdeskLegacy, periodEnd])

    useEffect(() => {
        if (convertProduct && !convertBanner && convertStatus) {
            if (
                convertStatus.bundle_status ===
                BundleOnboardingStatus.NOT_INSTALLED
            ) {
                setConvertBanner({
                    description: 'Get started with your Convert plan',
                    type: AlertType.Info,
                })
                void dispatch(
                    notify({
                        id: 'convert-subscription-activated',
                        message: `Your Convert subscription has been activated!`,
                        style: NotificationStyle.Banner,
                        status: NotificationStatus.Success,
                        actionHTML: (
                            <a
                                href="/app/settings/convert/installations"
                                rel="noreferrer"
                            >
                                Set Up Convert
                            </a>
                        ),
                    })
                )
            } else if (
                convertStatus.usage_status === UsageStatus.LIMIT_REACHED &&
                isConvertCampaignCappingEnabled
            ) {
                setConvertBanner({
                    description:
                        "You've reached the limit for your Convert. As a result, your campaigns are \n" +
                        "currently on hold. But there's a solution - upgrade now to bring \n" +
                        'them back to your website.',
                    type: AlertType.Error,
                })
            }
        }
        // trigger useEffect only when convertProduct is changed or status was fetched
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convertProduct, convertStatus])

    return (
        <div className="full-width">
            <PageHeader title="Billing" />
            {isCurrentSubscriptionCanceled ? null : (
                <SecondaryNavbar>
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
                    <NavLink to={BILLING_PAYMENT_PATH}>
                        Payment Information
                    </NavLink>
                    {!isPaymentShopify && (
                        <NavLink to={BILLING_PAYMENTS_HISTORY_PATH}>
                            Payment History
                        </NavLink>
                    )}
                </SecondaryNavbar>
            )}
            <Container fluid className={css.mainContainer}>
                {isUsageFetched ? (
                    <Switch>
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
                                helpdeskProduct={helpdeskProduct}
                                automationProduct={automationProduct}
                                voiceProduct={voiceProduct}
                                smsProduct={smsProduct}
                                isCurrentSubscriptionCanceled={
                                    isCurrentSubscriptionCanceled
                                }
                            />
                        </Route>
                        {!isPaymentShopify && (
                            <Route exact path={BILLING_PAYMENTS_HISTORY_PATH}>
                                <PaymentsHistoryView />
                            </Route>
                        )}
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
                            />
                        </Route>
                        <Route exact path={BILLING_INFORMATION_PATH}>
                            <BillingInformationView />
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
                                <PaymentMethodView
                                    contactBilling={contactBilling}
                                    dispatchBillingError={dispatchBillingError}
                                />
                            )}
                        </Route>
                    </Switch>
                ) : (
                    <Loader />
                )}
            </Container>
            <ContactSupportModal
                isOpen={isModalOpen}
                handleOnClose={() => {
                    setIsModalOpen(false)
                }}
                subject={subject}
                from={from}
                domain={domain}
                defaultMessage={defaultMessage}
                to={BILLING_SUPPORT_EMAIL}
                zapierHook={ZAPIER_BILLING_HOOK}
                prepareMessage={prepareMessage}
            />
        </div>
    )
}

export default BillingStartView
