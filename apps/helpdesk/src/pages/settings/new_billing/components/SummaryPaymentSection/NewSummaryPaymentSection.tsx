import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

import type {
    AchDebitBankAccount,
    BillingState,
    CreditCard as CreditCardType,
} from 'models/billing/types'
import Loader from 'pages/common/components/Loader/Loader'
import { useBillingStateWithSideEffects } from 'pages/settings/new_billing/hooks/useBillingStateWithSideEffects'
import { isCardExpired } from 'pages/settings/new_billing/utils/isCardExpired'

import css from './SummaryPaymentSection.less'

type Props = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> & {
    trackingSource: string
}

export const NewSummaryPaymentSection = ({
    trackingSource,
    ...props
}: Props) => {
    const billingState = useBillingStateWithSideEffects()

    if (!billingState.data)
        return <Loader minHeight="auto" className={css.loader} />

    return (
        <div {...props} className={classNames(css.container, props.className)}>
            <PaymentState
                billingState={billingState.data}
                trackingSource={trackingSource}
            />
        </div>
    )
}
function PaymentState({
    billingState,
    trackingSource,
}: {
    billingState: BillingState
    trackingSource: string
}) {
    // During account provisioning, billingState exists but customer is undefined
    // despite TypeScript types indicating customer is always present
    if (!billingState.customer) {
        return <AccountProvisioning />
    }

    const {
        credit_card: creditCard,
        shopify_billing: shopifyBilling,
        ach_debit_bank_account: achDebit,
        ach_credit_bank_account: achCredit,
    } = billingState.customer

    if (creditCard) {
        return (
            <CreditCard
                creditCard={creditCard}
                trackingSource={trackingSource}
            />
        )
    }

    if (shopifyBilling) {
        return (
            <ShopifyBilling
                subscriptionId={shopifyBilling.subscription_id}
                isTrialing={billingState.subscription.is_trialing}
            />
        )
    }

    if (achDebit) {
        return <ACHDebit achDebit={achDebit} trackingSource={trackingSource} />
    }

    if (achCredit) {
        return <ACHCredit />
    }

    // No payment method
    return <NoPaymentMethod trackingSource={trackingSource} />
}

const CreditCard = ({
    creditCard,
    trackingSource,
}: {
    creditCard: CreditCardType
    trackingSource: string
}) =>
    isCardExpired(creditCard) ? (
        <CreditCardExpired
            creditCard={creditCard}
            trackingSource={trackingSource}
        />
    ) : (
        <CreditCardValid
            creditCard={creditCard}
            trackingSource={trackingSource}
        />
    )

const CreditCardExpired = ({
    creditCard,
    trackingSource,
}: {
    creditCard: CreditCardType
    trackingSource: string
}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.warningIcon)}>
                warning
            </i>
            <strong className={css.cardBrand}>{creditCard.brand}</strong> ending
            with <strong>{creditCard.last4}</strong> is expired
        </div>
        <Link
            to={BILLING_PAYMENT_CARD_PATH}
            onClick={() => {
                logEvent(SegmentEvent.BillingUpdatePaymentMethodClicked, {
                    action: 'change',
                    source: trackingSource,
                })
            }}
        >
            Change Payment Method
        </Link>
    </>
)

const CreditCardValid = ({
    creditCard,
    trackingSource,
}: {
    creditCard: CreditCardType
    trackingSource: string
}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.cardIcon)}>
                credit_card
            </i>
            <strong className={css.cardBrand}>{creditCard.brand}</strong> ending
            with <strong>{creditCard.last4}</strong>
        </div>
        <Link
            to={BILLING_PAYMENT_CARD_PATH}
            onClick={() => {
                logEvent(SegmentEvent.BillingUpdatePaymentMethodClicked, {
                    action: 'change',
                    source: trackingSource,
                })
            }}
        >
            Change Payment Method
        </Link>
    </>
)

const ShopifyBilling = ({
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

const ShopifyBillingInactive = ({ isTrialing }: { isTrialing: boolean }) => (
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

const ShopifyBillingActive = ({
    subscriptionId,
}: {
    subscriptionId: string
}) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.successIcon)}>
                check_circle
            </i>
            {`Payment with Shopify is active (Subscription ID: ${subscriptionId}).
            You're all set.`}
        </div>
    </>
)

const ACHDebit = ({
    achDebit,
    trackingSource,
}: {
    achDebit: AchDebitBankAccount
    trackingSource: string
}) => (
    <>
        <div className={css.method}>
            Bank transfer (ACH debit) from account{' '}
            <strong>{achDebit.bank_name}</strong> ending with{' '}
            <strong>{achDebit.last4}</strong>
        </div>
        <Link
            to={BILLING_PAYMENT_CARD_PATH}
            onClick={() => {
                logEvent(SegmentEvent.BillingUpdatePaymentMethodClicked, {
                    action: 'change',
                    source: trackingSource,
                })
            }}
        >
            Change Payment Method
        </Link>
    </>
)

const ACHCredit = () => <>Bank transfer (ACH credit)</>

const NoPaymentMethod = ({ trackingSource }: { trackingSource: string }) => (
    <>
        <div className={css.method}>
            <i className={classNames('material-icons', css.warningIcon)}>
                warning
            </i>
            No payment method registered on your account
        </div>
        <Link
            to={BILLING_PAYMENT_CARD_PATH}
            onClick={() => {
                logEvent(SegmentEvent.BillingUpdatePaymentMethodClicked, {
                    action: 'add',
                    source: trackingSource,
                })
            }}
        >
            Add Payment Method
        </Link>
    </>
)

const AccountProvisioning = () => (
    <div className={css.method}>Account is being provisioned</div>
)
