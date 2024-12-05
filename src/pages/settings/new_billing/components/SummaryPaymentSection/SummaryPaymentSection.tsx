import classNames from 'classnames'
import React, {useEffect, useMemo} from 'react'
import {Link} from 'react-router-dom'

import {AlertBannerTypes} from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Loader from 'pages/common/components/Loader/Loader'
import {creditCard} from 'state/billing/selectors'
import {
    getShopifyBillingStatus,
    isTrialing,
    paymentMethod,
} from 'state/currentAccount/selectors'
import {ShopifyBillingStatus} from 'state/currentAccount/types'

import {notify} from 'state/notifications/actions'
import {NotificationStyle} from 'state/notifications/types'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '../../constants'
import css from './SummaryPaymentSection.less'

export type SummaryPaymentSectionProps = {
    setIsPaymentEnabled?: React.Dispatch<React.SetStateAction<boolean>>
    isCreditCardFetched: boolean
    isPaymentInformationView?: boolean
    hasSmallFont?: boolean
}

const SummaryPaymentSection = ({
    setIsPaymentEnabled,
    isCreditCardFetched,
    isPaymentInformationView,
    hasSmallFont,
}: SummaryPaymentSectionProps) => {
    const dispatch = useAppDispatch()

    const payment = useAppSelector(paymentMethod)
    const card = useAppSelector(creditCard)
    const isFreeTrial = useAppSelector(isTrialing)

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

            if (card.isEmpty() && !isFreeTrial) {
                setIsPaymentEnabled?.(false)
                void dispatch(
                    notify({
                        message: 'No payment method registered on your account',
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: BILLING_PAYMENT_CARD_PATH,
                            text: 'Add a payment method',
                        },
                        id: 'no-payment-method',
                    })
                )
            } else if (cardIsExpired) {
                const brand: string = card.get('brand')
                const last4: string = card.get('last4')

                setIsPaymentEnabled?.(false)
                void dispatch(
                    notify({
                        message: `${
                            brand[0].toUpperCase() + brand.slice(1)
                        } ending with ${last4} is expired`,
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: BILLING_PAYMENT_CARD_PATH,
                            text: 'Change Card',
                        },
                        id: 'payment-method-expired',
                    })
                )
            } else {
                setIsPaymentEnabled?.(true)
            }
        } else if (payment === 'shopify') {
            if (shopifyBillingStatus === ShopifyBillingStatus.Canceled) {
                setIsPaymentEnabled?.(false)
                void dispatch(
                    notify({
                        message: 'Payment with Shopify is canceled',
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                            text: 'Reactivate billing with Shopify',
                            opensInNewTab: true,
                        },
                        id: 'payment-method-canceled',
                    })
                )
            } else if (shopifyBillingStatus === ShopifyBillingStatus.Inactive) {
                setIsPaymentEnabled?.(false)
                void dispatch(
                    notify({
                        message: 'Payment with Shopify is inactive',
                        type: AlertBannerTypes.Warning,
                        style: NotificationStyle.Banner,
                        CTA: {
                            type: 'internal',
                            to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                            text: 'Activate Billing with Shopify',
                            opensInNewTab: true,
                        },
                        id: 'payment-method-expired',
                    })
                )
            } else {
                setIsPaymentEnabled?.(true)
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
        isFreeTrial,
    ])

    // Customer uses Shopify billing
    const renderShopify = useMemo(() => {
        switch (shopifyBillingStatus) {
            case ShopifyBillingStatus.Active:
                return (
                    <div
                        className={classNames(css.container, {
                            [css.paymentInformationView]:
                                isPaymentInformationView,
                        })}
                    >
                        <div
                            className={classNames(css.method, {
                                [css.smallFont]: hasSmallFont,
                            })}
                        >
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
                        className={classNames(css.container, {
                            [css.paymentInformationView]:
                                isPaymentInformationView,
                        })}
                        data-testid="canceledShopifyPayment"
                    >
                        <div
                            className={classNames(css.method, {
                                [css.smallFont]: hasSmallFont,
                            })}
                        >
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
                        <Link
                            to={ACTIVATE_PAYMENT_WITH_SHOPIFY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Reactivate billing with shopify
                        </Link>
                    </div>
                )

            case ShopifyBillingStatus.Inactive:
            default:
                return (
                    <div
                        className={classNames(css.container, {
                            [css.paymentInformationView]:
                                isPaymentInformationView,
                        })}
                        data-testid="inactiveShopifyPayment"
                    >
                        <div
                            className={classNames(css.method, {
                                [css.smallFont]: hasSmallFont,
                            })}
                        >
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
                        <Link
                            to={ACTIVATE_PAYMENT_WITH_SHOPIFY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Activate Billing with Shopify
                            {isFreeTrial && ' & Pay'}
                        </Link>
                    </div>
                )
        }
    }, [
        isPaymentInformationView,
        shopifyBillingStatus,
        hasSmallFont,
        isFreeTrial,
    ])

    const renderStripe = useMemo(() => {
        // Customer uses Stripe billing
        if (card.isEmpty()) {
            return (
                <div
                    className={classNames(css.container, {
                        [css.paymentInformationView]: isPaymentInformationView,
                    })}
                    data-testid="noPaymentMethod"
                >
                    <div
                        className={classNames(css.method, {
                            [css.smallFont]: hasSmallFont,
                        })}
                    >
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
                <div
                    className={classNames(css.container, {
                        [css.paymentInformationView]: isPaymentInformationView,
                    })}
                >
                    <div
                        className={classNames(css.method, {
                            [css.smallFont]: hasSmallFont,
                        })}
                        data-testid="cardIsExpired"
                    >
                        <i
                            className={classNames(
                                'material-icons',
                                css.warningIcon
                            )}
                        >
                            warning
                        </i>
                        <strong className={css.cardBrand}>
                            {card.get('brand')}
                        </strong>{' '}
                        ending with <strong>{card.get('last4')}</strong> is
                        expired
                    </div>
                    <Link to={BILLING_PAYMENT_CARD_PATH}>Change Card</Link>
                </div>
            )
        }

        return (
            <div
                className={classNames(css.container, {
                    [css.paymentInformationView]: isPaymentInformationView,
                })}
            >
                <div
                    className={classNames(css.method, {
                        [css.smallFont]: hasSmallFont,
                    })}
                    data-testid="validCreditCard"
                >
                    <i className={classNames('material-icons', css.cardIcon)}>
                        credit_card
                    </i>
                    <strong className={css.cardBrand}>
                        {card.get('brand')}
                    </strong>{' '}
                    ending with <strong>{card.get('last4')}</strong>
                </div>
                <Link to={BILLING_PAYMENT_CARD_PATH}>Change Card</Link>
            </div>
        )
    }, [card, cardIsExpired, isPaymentInformationView, hasSmallFont])

    if (!isCreditCardFetched && payment === 'stripe') {
        return <Loader minHeight="auto" className={css.loader} />
    }

    return payment === 'stripe' ? renderStripe : renderShopify
}

export default SummaryPaymentSection
