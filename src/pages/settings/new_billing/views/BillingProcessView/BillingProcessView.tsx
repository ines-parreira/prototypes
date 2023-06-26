import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import moment from 'moment'
import {dismissNotification} from 'reapop'

import useAppSelector from 'hooks/useAppSelector'
import {
    getAutomationProduct,
    getCurrentAutomationProduct,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
    getCurrentSMSProduct,
    getCurrentUsage,
    getCurrentVoiceProduct,
    getHelpdeskPrices,
    getSMSProduct,
    getVoiceProduct,
} from 'state/billing/selectors'
import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import Button from 'pages/common/components/button/Button'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import {objKeys} from 'utils'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {updateSubscriptionsForPlans} from 'state/currentAccount/actions'
import {isStarterTierPrice} from 'models/billing/utils'
import Card from '../../components/Card'
import BackLink from '../../components/BackLink'
import ProductPlanSelection from '../../components/ProductPlanSelection'
import SummaryItem from '../../components/SummaryItem'
import SummaryTotal from '../../components/SummaryTotal'
import SummaryPaymentSection from '../../components/SummaryPaymentSection'
import SummaryFooter from '../../components/SummaryFooter'
import {
    BILLING_SUPPORT_EMAIL,
    DATE_FORMAT,
    ENTERPRISE_PRICE_ID,
    INTERVAL,
    PRODUCT_INFO,
    TICKET_SUBJECTS,
    ZAPIER_BILLING_HOOK,
} from '../../constants'

import ContactSupportFormModal from '../../components/ContactSupportModal/ContactSupportModal'
import {formatNumTickets} from '../../utils/formatAmount'
import {sendSupportTicket} from '../../utils/sendSupportTicket'
import {setAutomationNotification, setHelpdeskNotification} from './utils'
import css from './BillingProcessView.less'

type Params = {
    selectedProduct: ProductType
}

export type SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan?: HelpdeskPrice
        isSelected: boolean
    }
    [ProductType.Automation]: {
        plan?: AutomationPrice
        isSelected: boolean
    }
    [ProductType.Voice]: {
        plan?: SMSOrVoicePrice
        isSelected: boolean
    }
    [ProductType.SMS]: {
        plan?: SMSOrVoicePrice
        isSelected: boolean
    }
}

export enum TicketPurpose {
    Enterprise = 'enterprise',
    YearlyToMonthly = 'yearlyToMonthly',
    Error = 'error',
    ContactUs = 'contactUs',
}

const BillingProcessView = () => {
    const history = useHistory()
    const interval =
        useAppSelector(getCurrentHelpdeskInterval) ?? PlanInterval.Month
    const dispatch = useAppDispatch()
    const isIntervalMonthly = interval === INTERVAL.Month
    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const currentUsage = useAppSelector(getCurrentUsage)
    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')
    const isTrialingSubscription = useAppSelector(isTrialing)

    // Selected product to Subscribe or Update
    const {selectedProduct} = useParams<Params>()

    const periodEnd = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'end_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            await dispatch(fetchCreditCard())
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [dispatch])

    // on page unload, remove error notification
    useEffect(() => {
        return () => {
            dispatch(dismissNotification('billing-error'))
        }
    }, [dispatch])

    // Helpdesk
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const helpdeskPrices = useAppSelector(getHelpdeskPrices).filter(
        (price) => price.interval === interval && price.num_quota_tickets
    )

    // Automation
    const automationProduct = useAppSelector(getCurrentAutomationProduct)
    const automationPrices = useAppSelector(
        getAutomationProduct
    )?.prices.filter((price) => price.interval === interval && price)

    // Voice
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const voicePrices = useAppSelector(getVoiceProduct)?.prices.filter(
        (price) => price.interval === interval && price.num_quota_tickets
    )

    // SMS
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const smsPrices = useAppSelector(getSMSProduct)?.prices.filter(
        (price) => price.interval === interval && price.num_quota_tickets
    )

    // Selected plans
    const [selectedPlans, setSelectedPlans] = useState<SelectedPlans>({
        [ProductType.Helpdesk]: {
            plan: helpdeskProduct || helpdeskPrices?.[0],
            isSelected:
                !!helpdeskProduct || selectedProduct === ProductType.Helpdesk,
        },
        [ProductType.Automation]: {
            plan: automationProduct || automationPrices?.[0],
            isSelected:
                !!automationProduct ||
                selectedProduct === ProductType.Automation,
        },
        [ProductType.Voice]: {
            plan: voiceProduct || voicePrices?.[0],
            isSelected: !!voiceProduct || selectedProduct === ProductType.Voice,
        },
        [ProductType.SMS]: {
            plan: smsProduct || smsPrices?.[0],
            isSelected: !!smsProduct || selectedProduct === ProductType.SMS,
        },
    })

    // Total amount for existing products
    const totalProductAmount = useMemo(() => {
        return (
            (helpdeskProduct?.amount ?? 0) +
            (automationProduct?.amount ?? 0) +
            (voiceProduct?.amount ?? 0) +
            (smsProduct?.amount ?? 0)
        )
    }, [helpdeskProduct, automationProduct, voiceProduct, smsProduct])

    const anyProductChanged = useMemo(
        () =>
            (helpdeskProduct?.price_id !==
                selectedPlans[ProductType.Helpdesk].plan?.price_id &&
                selectedPlans[ProductType.Helpdesk].isSelected) ||
            (automationProduct?.price_id !==
                selectedPlans[ProductType.Automation].plan?.price_id &&
                selectedPlans[ProductType.Automation].isSelected) ||
            (voiceProduct?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id &&
                selectedPlans[ProductType.Voice].isSelected) ||
            (smsProduct?.price_id !==
                selectedPlans[ProductType.SMS].plan?.price_id &&
                selectedPlans[ProductType.SMS].isSelected),
        [
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
            selectedPlans,
        ]
    )

    const anyNewProductSelected = useMemo(
        () =>
            (selectedPlans[ProductType.Helpdesk].isSelected &&
                !helpdeskProduct) ||
            (selectedPlans[ProductType.Automation].isSelected &&
                !automationProduct) ||
            (selectedPlans[ProductType.Voice].isSelected && !voiceProduct) ||
            (selectedPlans[ProductType.SMS].isSelected && !smsProduct),
        [
            selectedPlans,
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
        ]
    )

    const anyDowngradedPlanSelected = useMemo(
        () =>
            (helpdeskProduct &&
                helpdeskProduct.amount >
                    (selectedPlans[ProductType.Helpdesk].plan?.amount || 0)) ||
            (automationProduct &&
                automationProduct.amount >
                    (selectedPlans[ProductType.Automation].plan?.amount ||
                        0)) ||
            (voiceProduct &&
                voiceProduct.amount >
                    (selectedPlans[ProductType.Voice].plan?.amount || 0)) ||
            (smsProduct &&
                smsProduct.amount >
                    (selectedPlans[ProductType.SMS].plan?.amount || 0)),
        [
            selectedPlans,
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
        ]
    )

    const isStarterHelpdeskPlanSelected = useMemo(
        () =>
            isStarterTierPrice(selectedPlans[ProductType.Helpdesk].plan) &&
            selectedPlans[ProductType.Helpdesk].isSelected,
        [selectedPlans]
    )

    const isEnterpriseHelpdeskPlanSelected = useMemo(
        () =>
            Object.values(selectedPlans).some(
                (plan) =>
                    plan.plan?.price_id === ENTERPRISE_PRICE_ID &&
                    plan.isSelected
            ),
        [selectedPlans]
    )

    const [isModalOpen, setIsModalOpen] = useState(false)

    const [subject, setSubject] = useState(
        `${TICKET_SUBJECTS.Enterprise} - ${domain}`
    )
    const messageForEnterprise = useMemo(() => {
        let message =
            "Hey Gorgias, I'd like to get a quote for the following bundle of products:\n"

        // Get selected plans' details
        Object.values(ProductType).map((key) => {
            const productType = key as ProductType
            const productName = key.charAt(0).toUpperCase() + key.slice(1)
            const selectedPlan = selectedPlans[productType].plan

            if (selectedPlans[productType]?.isSelected) {
                const isEnterprisePlan =
                    selectedPlan?.price_id === ENTERPRISE_PRICE_ID
                const tickets = `${formatNumTickets(
                    selectedPlan?.num_quota_tickets ?? 0
                )}${isEnterprisePlan ? '+' : ''}`

                message += `\n • ${productName} - ${tickets} ${
                    PRODUCT_INFO[productType].counter
                }/${interval} ${isEnterprisePlan ? '(Enterprise)' : ''}`
            }
        })

        return message
    }, [selectedPlans, interval])

    const [defaultMessage, setDefaultMessage] = useState('')
    const [ticketPurpose, setTicketPurpose] = useState<TicketPurpose>(
        TicketPurpose.Enterprise
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
                    onClick: () => contactBilling(TicketPurpose.Error),
                },
            ],
            noAutoDismiss: true,
            showDismissButton: true,
            status: NotificationStatus.Error,
            id: 'billing-error',
        }),
        [contactBilling]
    )

    const prepareMessage = useCallback(
        (message: string) => {
            switch (ticketPurpose) {
                case TicketPurpose.Enterprise:
                    return `Billing request: Enterprise subscription\n Merchant Helpdesk plan: ${
                        helpdeskProduct?.name ?? ''
                    }\nFree trial: ${
                        isTrialingSubscription ? 'true' : 'false'
                    }\nRequest:\n${message}`
                case TicketPurpose.ContactUs:
                    return `Billing request: General request from Billing page\nRequest:\n${message}`
                case TicketPurpose.Error:
                    return `Billing request: Billing error\nRequest:\n${message}`
                default:
                    return message
            }
        },
        [helpdeskProduct?.name, isTrialingSubscription, ticketPurpose]
    )

    const dispatchBillingError = useCallback(() => {
        void dispatch(notify(billingErrorNotification))
    }, [billingErrorNotification, dispatch])

    const handleSMSAndVoicePlansChange = useCallback(async () => {
        const plansToBeHandledManually: ProductType[] = []
        objKeys(selectedPlans).forEach((key) => {
            if (selectedPlans[key].isSelected) {
                if (key === ProductType.SMS || key === ProductType.Voice) {
                    if (
                        selectedPlans[key].plan?.internal_id !==
                            smsProduct?.internal_id &&
                        selectedPlans[key].plan?.internal_id !==
                            voiceProduct?.internal_id
                    ) {
                        plansToBeHandledManually.push(key)
                    }
                }
            }
        })

        // create zapier for SMS and Voice plan updates or new subscriptions, to be handled manually
        if (plansToBeHandledManually.length > 0) {
            const productsNames = plansToBeHandledManually
                .map((product) => PRODUCT_INFO[product].title)
                .join(' & ')
            const subject = `${productsNames} Add-on Plan selection - ${domain}`
            const newPlans = plansToBeHandledManually.map(
                (product) =>
                    `${PRODUCT_INFO[product].title} plan request: ${
                        selectedPlans[product].plan?.name ?? ''
                    }`
            )
            const message = `New ${productsNames} Add-on Request by ${domain}\nProduct(s): ${subject}\n${newPlans.join(
                '\n'
            )}`

            try {
                await sendSupportTicket({
                    subject,
                    message,
                    from,
                    zapierHook: ZAPIER_BILLING_HOOK,
                    to: BILLING_SUPPORT_EMAIL,
                })
                void dispatch(
                    notify({
                        message: `We're reviewing your <strong>${productsNames}</strong> plan${
                            plansToBeHandledManually.length > 1 ? 's' : ''
                        } request and will contact you at <b>${from}</b>`,
                        actionHTML: `<span class="d-inline-flex align-items-baseline"><span class="text-primary">Contact Billing</span></span>`,
                        onClick: () => contactBilling(TicketPurpose.ContactUs),
                        allowHTML: true,
                        status: NotificationStatus.Info,
                        style: NotificationStyle.Alert,
                        showIcon: true,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        id: 'billing-voice-sms-request',
                    })
                )
            } catch (error) {
                dispatchBillingError()
            }
        }
    }, [
        contactBilling,
        dispatch,
        dispatchBillingError,
        domain,
        from,
        selectedPlans,
        smsProduct?.internal_id,
        voiceProduct?.internal_id,
    ])

    const handleHelpdeskAndAutomationPlansChange = useCallback(async () => {
        const plansToBeUpdatedAutomatically: string[] = []
        const notifications: Notification[] = []

        // handle subscribe for Helpdesk plan
        if (
            selectedPlans[ProductType.Helpdesk].isSelected &&
            selectedPlans[ProductType.Helpdesk].plan?.price_id !==
                helpdeskProduct?.price_id
        ) {
            // Set the notification
            const notification = setHelpdeskNotification({
                oldProduct: helpdeskProduct,
                newProduct: selectedPlans[ProductType.Helpdesk].plan,
                periodEnd,
                onClick: () => {
                    history.push('/app/settings')
                },
            })

            // Add the notification
            notifications.push(notification)

            // Add the plan to be handled automatically
            plansToBeUpdatedAutomatically.push(
                selectedPlans[ProductType.Helpdesk].plan?.price_id ?? ''
            )
        }

        // handle subscribe for Automation plan
        if (
            selectedPlans[ProductType.Automation].isSelected &&
            selectedPlans[ProductType.Automation].plan?.price_id !==
                automationProduct?.price_id
        ) {
            const notification = setAutomationNotification({
                oldProduct: automationProduct,
                newProduct: selectedPlans[ProductType.Automation].plan,
                periodEnd,
                onClick: () => {
                    history.push('/app/settings')
                },
                interval,
            })

            // Add the notification
            notifications.push(notification)

            // Add the plan to be handled automatically
            plansToBeUpdatedAutomatically.push(
                selectedPlans[ProductType.Automation].plan?.price_id ?? ''
            )
        }

        // update subscription for Helpdesk and Automation plans
        if (plansToBeUpdatedAutomatically.length > 0) {
            try {
                await dispatch(
                    updateSubscriptionsForPlans(
                        {
                            prices: plansToBeUpdatedAutomatically,
                        },
                        notifications,
                        billingErrorNotification
                    )
                )
            } catch (error) {
                dispatchBillingError()
            }
        }
    }, [
        selectedPlans,
        helpdeskProduct,
        automationProduct,
        periodEnd,
        history,
        interval,
        dispatch,
        billingErrorNotification,
        dispatchBillingError,
    ])

    const handleSubscribe = useCallback(() => {
        // handle Helpdesk and Automation plans
        void handleHelpdeskAndAutomationPlansChange()

        // handle SMS and Voice plans
        void handleSMSAndVoicePlansChange()
    }, [handleHelpdeskAndAutomationPlansChange, handleSMSAndVoicePlansChange])

    return (
        <div className={css.container}>
            <div className={css.header}>
                <BackLink />

                <div className={css.generalInfoItem}>
                    <span>
                        Billed {isIntervalMonthly ? 'Monthly' : 'Yearly'}
                    </span>
                    <a href="#">Update</a>
                </div>
            </div>
            <div className={css.cards}>
                <Card
                    title={'Select Plans'}
                    link={{url: '#', text: 'See Plans Details'}}
                >
                    <div className={css.products}>
                        <ProductPlanSelection
                            type={ProductType.Helpdesk}
                            interval={interval}
                            product={helpdeskProduct}
                            prices={helpdeskPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                        />
                        <ProductPlanSelection
                            type={ProductType.Automation}
                            interval={interval}
                            product={automationProduct}
                            prices={automationPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                        />
                        <ProductPlanSelection
                            type={ProductType.Voice}
                            interval={interval}
                            product={voiceProduct}
                            prices={voicePrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                        />
                        <ProductPlanSelection
                            type={ProductType.SMS}
                            interval={interval}
                            product={smsProduct}
                            prices={smsPrices}
                            selectedPlans={selectedPlans}
                            setSelectedPlans={setSelectedPlans}
                            isStarterHelpdeskPlanSelected={
                                isStarterHelpdeskPlanSelected
                            }
                        />
                    </div>
                </Card>
                {isEnterpriseHelpdeskPlanSelected ? (
                    <Card title="Enterprise Plan">
                        <div className={css.enterprisePlanText}>
                            To subscribe to our Enterprise plan, please get in
                            touch with our team.
                        </div>
                        <div className={css.enterprisePlanFooter}>
                            <Button
                                intent="primary"
                                onClick={() => {
                                    setDefaultMessage(messageForEnterprise)
                                    setIsModalOpen(true)
                                }}
                            >
                                Contact Us
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card title={'Summary'}>
                        <div className={css.summary}>
                            <div className={css.summaryHeader}>
                                <div>PRODUCT</div>
                                <div>PRICE</div>
                            </div>
                            <SummaryItem
                                type={ProductType.Helpdesk}
                                interval={interval}
                                product={helpdeskProduct}
                                prices={helpdeskPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.Automation}
                                interval={interval}
                                product={automationProduct}
                                prices={automationPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.Voice}
                                interval={interval}
                                product={voiceProduct}
                                prices={voicePrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryItem
                                type={ProductType.SMS}
                                interval={interval}
                                product={smsProduct}
                                prices={smsPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryTotal
                                selectedPlans={selectedPlans}
                                totalProductAmount={totalProductAmount}
                                interval={interval}
                                currency={helpdeskPrices?.[0].currency}
                            />
                        </div>
                        <SummaryPaymentSection
                            setIsPaymentEnabled={setIsPaymentEnabled}
                            isCreditCardFetched={isCreditCardFetched}
                        />
                        <SummaryFooter
                            isPaymentEnabled={isPaymentEnabled}
                            anyProductChanged={anyProductChanged}
                            anyNewProductSelected={anyNewProductSelected}
                            anyDowngradedPlanSelected={
                                !!anyDowngradedPlanSelected
                            }
                            handleSubscribe={handleSubscribe}
                        />
                    </Card>
                )}
            </div>
            <ContactSupportFormModal
                isOpen={isModalOpen}
                handleOnClose={() => setIsModalOpen(false)}
                prepareMessage={prepareMessage}
                defaultMessage={defaultMessage}
                domain={domain}
                zapierHook={ZAPIER_BILLING_HOOK}
                subject={subject}
                to={BILLING_SUPPORT_EMAIL}
                from={from}
            />
        </div>
    )
}

export default BillingProcessView
