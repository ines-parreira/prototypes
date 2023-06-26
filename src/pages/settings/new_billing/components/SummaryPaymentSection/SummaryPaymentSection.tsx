import React, {useEffect, useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'

import {
    getShopifyBillingStatus,
    paymentMethod,
} from 'state/currentAccount/selectors'
import {creditCard} from 'state/billing/selectors'
import {ShopifyBillingStatus} from 'state/currentAccount/types'
import useAppSelector from 'hooks/useAppSelector'

import {NotificationStatus, NotificationStyle} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/common/components/Loader/Loader'
import {BILLING_PAYMENT_CARD_PATH} from '../../constants'
import css from './SummaryPaymentSection.less'

export type SummaryPaymentSectionProps = {
    setIsPaymentEnabled: React.Dispatch<React.SetStateAction<boolean>>
    isCreditCardFetched: boolean
}

const SummaryPaymentSection = ({
    setIsPaymentEnabled,
    isCreditCardFetched,
}: SummaryPaymentSectionProps) => {
    const dispatch = useAppDispatch()

    const payment = useAppSelector(paymentMethod)
    const card = useAppSelector(creditCard)

    // Get the current date
    const currentDate = new Date()

    // Extract the current month and year
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Get the card's expiration month and year
    const cardExpMonth = card.get('exp_month')
    const cardExpYear = card.get('exp_year')

    // Compare the card's expiration date with the current date
    const cardIsExpired = useMemo(
        () =>
            cardExpYear < currentYear ||
            (cardExpYear === currentYear && cardExpMonth < currentMonth),
        [cardExpMonth, cardExpYear, currentMonth, currentYear]
    )

    const shopifyBillingStatus = useAppSelector(getShopifyBillingStatus)

    useEffect(() => {
        if (payment === 'stripe') {
            if (!isCreditCardFetched) {
                return
            }

            if (card.isEmpty()) {
                setIsPaymentEnabled(false)
                void dispatch(
                    notify({
                        message: 'No payment method registered on your account',
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        showIcon: true,
                        allowHTML: true,
                        actionHTML: `<Link to={${BILLING_PAYMENT_CARD_PATH}}>
                                Add a payment method
                            </Link>`,
                        id: 'no-payment-method',
                    })
                )
            } else if (cardIsExpired) {
                const brand: string = card.get('brand')
                const last4: string = card.get('last4')

                setIsPaymentEnabled(false)
                void dispatch(
                    notify({
                        message: `${brand} ending with ${last4} is expired`,
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        showIcon: true,
                        allowHTML: true,
                        actionHTML: (
                            <Link to={BILLING_PAYMENT_CARD_PATH}>
                                Change Card
                            </Link>
                        ),
                        id: 'payment-method-expired',
                    })
                )
            } else {
                setIsPaymentEnabled(true)
            }
        } else if (payment === 'shopify') {
            if (shopifyBillingStatus === ShopifyBillingStatus.Canceled) {
                setIsPaymentEnabled(false)
                void dispatch(
                    notify({
                        message: 'Payment with Shopify is canceled',
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        showIcon: true,
                        allowHTML: true,
                        actionHTML: (
                            <Link to="/integrations/shopify/billing/activate/">
                                Reactivate billing with Shopify
                            </Link>
                        ),
                        id: 'payment-method-expired',
                    })
                )
            } else if (shopifyBillingStatus === ShopifyBillingStatus.Inactive) {
                setIsPaymentEnabled(false)
                void dispatch(
                    notify({
                        message: 'Payment with Shopify is inactive',
                        status: NotificationStatus.Warning,
                        style: NotificationStyle.Banner,
                        showIcon: true,
                        allowHTML: true,
                        actionHTML: (
                            <Link to="/integrations/shopify/billing/activate/">
                                Activate Billing with Shopify
                            </Link>
                        ),
                        id: 'payment-method-expired',
                    })
                )
            } else {
                setIsPaymentEnabled(true)
            }
        }
    }, [
        card,
        dispatch,
        cardIsExpired,
        payment,
        shopifyBillingStatus,
        isCreditCardFetched,
        setIsPaymentEnabled,
    ])

    // Customer uses Shopify billing
    const renderShopify = useMemo(() => {
        switch (shopifyBillingStatus) {
            case ShopifyBillingStatus.Active:
                return (
                    <div
                        className={css.container}
                        data-testid="activeShopifyPayment"
                    >
                        <div className={css.method}>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.successIcon
                                )}
                            >
                                check_circle
                            </i>
                            Payment with Shopify is active. You're all set.
                        </div>
                    </div>
                )

            case ShopifyBillingStatus.Canceled:
                return (
                    <div
                        className={css.container}
                        data-testid="canceledShopifyPayment"
                    >
                        <div className={css.method}>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.warningIcon
                                )}
                            >
                                warning
                            </i>
                            Payment with Shopify is canceled.
                        </div>
                        <Link to="/integrations/shopify/billing/activate/">
                            Reactivate billing with shopify
                        </Link>
                    </div>
                )

            case ShopifyBillingStatus.Inactive:
            default:
                return (
                    <div
                        className={css.container}
                        data-testid="inactiveShopifyPayment"
                    >
                        <div className={css.method}>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.warningIcon
                                )}
                            >
                                warning
                            </i>
                            Payment with Shopify is inactive.
                        </div>
                        <Link to="/integrations/shopify/billing/activate/">
                            Activate Billing with Shopify
                        </Link>
                    </div>
                )
        }
    }, [shopifyBillingStatus])

    const renderStripe = useMemo(() => {
        // Customer uses Stripe billing
        if (card.isEmpty()) {
            return (
                <div className={css.container} data-testid="noPaymentMethod">
                    <div className={css.method}>
                        <i
                            className={classNames(
                                'material-icons',
                                css.warningIcon
                            )}
                        >
                            warning
                        </i>
                        No payment method registered on your account
                    </div>
                    <Link to={BILLING_PAYMENT_CARD_PATH}>
                        Add Payment Method
                    </Link>
                </div>
            )
        }

        if (cardIsExpired) {
            return (
                <div className={css.container}>
                    <div className={css.method} data-testid="cardIsExpired">
                        <i
                            className={classNames(
                                'material-icons',
                                css.warningIcon
                            )}
                        >
                            warning
                        </i>
                        <strong>{card.get('brand')}</strong> ending with{' '}
                        <strong>{card.get('last4')}</strong> is expired
                    </div>
                    <Link to={BILLING_PAYMENT_CARD_PATH}>Change Card</Link>
                </div>
            )
        }

        return (
            <div className={css.container} data-testid="validCreditCard">
                <div className={css.method}>
                    <i className={classNames('material-icons', css.cardIcon)}>
                        credit_card
                    </i>
                    <strong>{card.get('brand')}</strong> ending with{' '}
                    <strong>{card.get('last4')}</strong>
                </div>
                <Link to={BILLING_PAYMENT_CARD_PATH}>Change Card</Link>
            </div>
        )
    }, [card, cardIsExpired])

    if (!isCreditCardFetched && payment === 'stripe') {
        return <Loader minHeight="auto" className={css.loader} />
    }

    return payment === 'stripe' ? renderStripe : renderShopify
}

export default SummaryPaymentSection
