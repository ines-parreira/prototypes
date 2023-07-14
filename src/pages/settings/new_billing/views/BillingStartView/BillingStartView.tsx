import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {NavLink, Route, Switch, useHistory} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketPurpose} from 'state/billing/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {
    getCurrentAutomationProduct,
    getCurrentHelpdeskProduct,
    getCurrentProductsUsage,
} from 'state/billing/selectors'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {fetchCurrentProductsUsage} from 'state/billing/actions'
import Loader from 'pages/common/components/Loader/Loader'
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
import CardView from '../CardView/CardView'
import css from './BillingStartView.less'

const BillingStartView = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const currentUsage = useAppSelector(getCurrentProductsUsage)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const automationProduct = useAppSelector(getCurrentAutomationProduct)

    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

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
    const [voiceBanner, setVoiceBanner] = useState('')
    const [smsBanner, setSMSBanner] = useState('')

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
            setIsUsageFetched(true)
        }

        if (!currentUsage) {
            void fetchUsage()
        } else {
            setIsUsageFetched(true)
        }
    }, [currentUsage, dispatch])

    useEffect(() => {
        if (currentUsage?.voice) {
            const subscriptionStartDate = moment(
                currentUsage.voice.meta.subscription_start_datetime
            )
            const now = moment()
            const isSubscriptionNew =
                now.diff(subscriptionStartDate, 'hours') < 24

            if (isSubscriptionNew) {
                setVoiceBanner('Get started with your Voice plan')
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
                setSMSBanner('Get started with your SMS plan')
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
    }, [currentUsage, dispatch])

    if (!hasAccessToNewBilling) {
        return null
    }

    return (
        <div className="full-width">
            <PageHeader title="Billing" />
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
                <NavLink to={BILLING_PAYMENT_PATH}>Payment Information</NavLink>
                <NavLink to={BILLING_PAYMENTS_HISTORY_PATH}>
                    Payment History
                </NavLink>
            </SecondaryNavbar>
            <Container fluid className={css.mainContainer}>
                {isUsageFetched ? (
                    <Switch>
                        <Route exact path={BILLING_BASE_PATH}>
                            <UsageAndPlansView
                                setIsModalOpen={setIsModalOpen}
                                periodEnd={periodEnd}
                                currentUsage={currentUsage}
                                voiceBanner={voiceBanner}
                                smsBanner={smsBanner}
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_PATH}>
                            <PaymentInformationView
                                setIsModalOpen={setIsModalOpen}
                                helpdeskProduct={helpdeskProduct}
                                automationProduct={automationProduct}
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
                                periodEnd={periodEnd}
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
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_CARD_PATH}>
                            <CardView />
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
                    history.push(BILLING_BASE_PATH)
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
