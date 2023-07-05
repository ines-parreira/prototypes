import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {NavLink, Route, Switch} from 'react-router-dom'
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
    getCurrentHelpdeskProduct,
    getCurrentProductsUsage,
} from 'state/billing/selectors'
import {Notification, NotificationStatus} from 'state/notifications/types'
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
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const currentUsage = useAppSelector(getCurrentProductsUsage)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)

    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [subject, setSubject] = useState('')
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
            id: 'billing-error',
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
                case TicketPurpose.CONTACT_US:
                    return [
                        `Billing request: General request from Billing page`,
                        `Request:`,
                        message,
                    ].join('\n')
                case TicketPurpose.ERROR:
                    return [
                        `Billing request: Billing error`,
                        `Request:`,
                        message,
                    ].join('\n')
                default:
                    return message
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
                            />
                        </Route>
                        <Route exact path={BILLING_PAYMENT_PATH}>
                            <PaymentInformationView
                                setIsModalOpen={setIsModalOpen}
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
                                billingErrorNotification={
                                    billingErrorNotification
                                }
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
                                billingErrorNotification={
                                    billingErrorNotification
                                }
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
                handleOnClose={() => setIsModalOpen(false)}
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
