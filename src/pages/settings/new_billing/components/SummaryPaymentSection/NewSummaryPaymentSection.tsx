import classNames from 'classnames'
import React from 'react'
import {Link} from 'react-router-dom'

import {
    BillingState,
    type CreditCard,
    type AchDebitBankAccount,
} from 'models/billing/types'
import Loader from 'pages/common/components/Loader/Loader'

import {useBillingStateWithSideEffects} from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'
import {isCardExpired} from 'pages/settings/new_billing/utils/isCardExpired'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '../../constants'
import css from './SummaryPaymentSection.less'

type Props = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>

export const NewSummaryPaymentSection = (props: Props) => {
    const billingState = useBillingStateWithSideEffects()

    if (!billingState.data)
        return <Loader minHeight="auto" className={css.loader} />

    return (
        <div {...props} className={classNames(css.container, props.className)}>
            <PaymentState billingState={billingState.data} {...props} />
        </div>
    )
}
function PaymentState({billingState}: {billingState: BillingState}) {
    const {
        credit_card: creditCard,
        shopify_billing: shopifyBilling,
        ach_debit_bank_account: achDebit,
        ach_credit_bank_account: achCredit,
    } = billingState.customer

    if (creditCard) {
        return <CreditCard creditCard={creditCard} />
    }

    if (shopifyBilling) {
        return (
            <ShopfyBilling
                subscriptionId={shopifyBilling.subscription_id}
                isTrialing={billingState.subscription.is_trialing}
            />
        )
    }

    if (achDebit) {
        return <ACHDebit achDebit={achDebit} />
    }

    if (achCredit) {
        return <ACHCredit />
    }

    // No payment method
    return <NoPaymentMethod />
}

const CreditCard = ({creditCard}: {creditCard: CreditCard}) =>
    isCardExpired(creditCard) ? (
        <CreditCardExpired creditCard={creditCard} />
    ) : (
        <CreditCardValid creditCard={creditCard} />
    )

const CreditCardExpired = ({creditCard}: {creditCard: CreditCard}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.warningIcon)}>
                warning
            </i>
            <strong className={css.cardBrand}>{creditCard.brand}</strong> ending
            with <strong>{creditCard.last4}</strong> is expired
        </div>
        <Link to={BILLING_PAYMENT_CARD_PATH}>Change Payment Method</Link>
    </>
)

const CreditCardValid = ({creditCard}: {creditCard: CreditCard}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.cardIcon)}>
                credit_card
            </i>
            <strong className={css.cardBrand}>{creditCard.brand}</strong> ending
            with <strong>{creditCard.last4}</strong>
        </div>
        <Link to={BILLING_PAYMENT_CARD_PATH}>Change Payment Method</Link>
    </>
)

const ShopfyBilling = ({
    subscriptionId,
    isTrialing,
}: {
    subscriptionId: string | null
    isTrialing: boolean
}) =>
    subscriptionId === null ? (
        <ShopifyBillingInactive isTrialing={isTrialing} />
    ) : (
        <ShopifyBillingActive subscriptionId={subscriptionId} />
    )

const ShopifyBillingInactive = ({isTrialing}: {isTrialing: boolean}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.warningIcon)}>
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
            {isTrialing && ' & Pay'}
        </Link>
    </>
)

const ShopifyBillingActive = ({subscriptionId}: {subscriptionId: string}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.successIcon)}>
                check_circle
            </i>
            Payment with Shopify is active (Subscription ID: {subscriptionId}).
            You're all set.
        </div>
    </>
)

const ACHDebit = ({achDebit}: {achDebit: AchDebitBankAccount}) => (
    <>
        <div className={css.method}>
            Bank transfer (ACH debit) from account{' '}
            <strong>{achDebit.bank_name}</strong> ending with{' '}
            <strong>{achDebit.last4}</strong>
        </div>
        <Link to={BILLING_PAYMENT_CARD_PATH}>Change Payment Method</Link>
    </>
)

const ACHCredit = () => <>Bank transfer (ACH credit)</>

const NoPaymentMethod = () => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.warningIcon)}>
                warning
            </i>
            No payment method registered on your account
        </div>
        <Link to={BILLING_PAYMENT_CARD_PATH}>Add Payment Method</Link>
    </>
)
