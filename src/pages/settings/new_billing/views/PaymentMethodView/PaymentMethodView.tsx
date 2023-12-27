import React from 'react'

import {Form} from 'reactstrap'
import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import {TicketPurpose} from 'state/billing/types'
import useAppSelector from 'hooks/useAppSelector'
import useSessionStorage from 'hooks/useSessionStorage'
import {isTrialing as useIsTrialing} from 'state/currentAccount/selectors'
import BackLink from '../../components/BackLink/BackLink'
import {useCreditCard} from '../../hooks/useCreditCard'
import AddressForm from '../../components/AddressForm/AddressForm'
import {emailError} from '../../utils/validations'
import Card from '../../components/Card'
import SummaryItem from '../../components/SummaryItem'
import {ProductType} from '../../../../../models/billing/types'
import SummaryTotal from '../../components/SummaryTotal'
import SummaryFooter from '../../components/SummaryFooter'
import {useBillingPlans} from '../../hooks/useBillingPlan'
import {SELECTED_PRODUCTS_SESSION_STORAGE_KEY} from '../../constants'
import {SelectedPlans} from '../BillingProcessView/BillingProcessView'
import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from './utils'
import css from './PaymentMethodView.less'

type PaymentMethodViewProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
}

const PaymentMethodView = ({
    contactBilling,
    dispatchBillingError,
}: PaymentMethodViewProps) => {
    const isTrialing = useAppSelector(useIsTrialing)

    const {
        fields,
        errors,
        isStripeLoaded,
        isCardValid,
        isSubmitting,
        isUpdating,
        isTrialingSubscription,
        handleSubmit,
        updateField,
        billingContact,
        setBillingContact,
        isCreditCardFetched,
        isContactFetched,
    } = useCreditCard({contactBilling, dispatchBillingError})

    const {
        helpdeskProduct,
        helpdeskPrices,
        automateProduct,
        automatePrices,
        smsProduct,
        smsPrices,
        convertProduct,
        convertPrices,
        voiceProduct,
        voicePrices,
        anyDowngradedPlanSelected,
        totalProductAmount,
        interval,
        isSubscriptionCanceled,
        selectedPlans: selectedPlansFromState,
    } = useBillingPlans({
        contactBilling,
        dispatchBillingError,
        filterByInterval: true,
    })

    const [selectedPlansFromSessionStorage] = useSessionStorage<SelectedPlans>(
        SELECTED_PRODUCTS_SESSION_STORAGE_KEY
    )

    const selectedPlans = isSubscriptionCanceled
        ? selectedPlansFromSessionStorage
        : selectedPlansFromState

    const currentMonth = new Date().getMonth() + 1

    const expiryDatePlaceholder = `${currentMonth
        .toString()
        .padStart(2, '0')} / ${new Date()
        .getFullYear()
        .toString()
        .substring(2, 4)}`

    const isBillingContactValid =
        emailError(billingContact?.email) === undefined &&
        !!billingContact?.shipping.address.line1 &&
        !!billingContact?.shipping.address.city &&
        !!billingContact?.shipping.address.country &&
        !!billingContact?.shipping.address.postal_code

    if (!isStripeLoaded || !isCreditCardFetched || !isContactFetched) {
        return <Loader />
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <BackLink />
            </div>
            <div className={css.cards}>
                <Card title="Payment Method">
                    <Form
                        onSubmit={(e) => {
                            void handleSubmit(e)
                        }}
                        className={css.form}
                    >
                        <InputField
                            id="name"
                            label="Name on the card"
                            placeholder="Marie Curie"
                            isRequired
                            value={fields.name}
                            onChange={(name) => {
                                updateField('name', name)
                            }}
                            error={errors.name}
                            data-testid="name"
                        />
                        <div className={css.row}>
                            <InputField
                                className={css.inputRow}
                                id="number"
                                label="Card number"
                                placeholder="4657 7894 1234 7895"
                                isRequired
                                value={fields.number}
                                onChange={(newNumber) =>
                                    updateField(
                                        'number',
                                        creditCardNormalizer(
                                            newNumber,
                                            fields.number
                                        )
                                    )
                                }
                                error={errors.number}
                                data-testid="number"
                            />
                            <InputField
                                className={css.inputRow}
                                id="expDate"
                                label="Exp date"
                                placeholder={expiryDatePlaceholder}
                                isRequired
                                value={fields.expDate}
                                onChange={(newExpDate) =>
                                    updateField(
                                        'expDate',
                                        creditCardExpDateNormalizer(
                                            newExpDate,
                                            fields.expDate
                                        )
                                    )
                                }
                                error={errors.expDate}
                                data-testid="expDate"
                            />
                            <InputField
                                className={css.inputRow}
                                id="cvc"
                                label="CVC"
                                placeholder="693"
                                isRequired
                                value={fields.cvc}
                                onChange={(newCvc) =>
                                    updateField(
                                        'cvc',
                                        creditCardCVCNormalizer(
                                            newCvc,
                                            fields.cvc
                                        )
                                    )
                                }
                                error={errors.cvc}
                                data-testid="cvc"
                            />
                        </div>
                        <div className={css.disclaimer}>
                            <i className="material-icons-outlined">info</i>
                            <span>
                                <b>A temporary $1 charge</b> will be applied to
                                new payment methods, and be{' '}
                                <b>refunded within 7 days.</b>
                            </span>
                        </div>
                        {!isUpdating && (
                            <AddressForm
                                billingContact={billingContact}
                                setBillingContact={setBillingContact}
                            />
                        )}
                        {!isTrialingSubscription && !isSubscriptionCanceled && (
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                isDisabled={
                                    !isCardValid ||
                                    (!isUpdating && !isBillingContactValid)
                                }
                                className={css.submitButton}
                            >
                                {isUpdating
                                    ? 'Update card'
                                    : 'Add payment method'}
                            </Button>
                        )}
                    </Form>
                </Card>
                {(isTrialing ||
                    (isSubscriptionCanceled &&
                        !!selectedPlansFromSessionStorage)) && (
                    <Card title="Summary">
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
                                product={automateProduct}
                                prices={automatePrices}
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
                            <SummaryItem
                                type={ProductType.Convert}
                                interval={interval}
                                product={convertProduct}
                                prices={convertPrices}
                                selectedPlans={selectedPlans}
                            />
                            <SummaryTotal
                                selectedPlans={selectedPlans}
                                totalProductAmount={totalProductAmount}
                                interval={interval}
                                currency={helpdeskPrices?.[0].currency}
                            />
                        </div>
                        <h2 className={css.startSubscriptionTitle}>
                            Start your subscription today
                        </h2>
                        <SummaryFooter
                            isPaymentEnabled={true}
                            isTrialing={isTrialing}
                            isCurrentSubscriptionCanceled={
                                isSubscriptionCanceled
                            }
                            isPaymentMethodFooter={true}
                            isPaymentMethodValid={
                                isCardValid &&
                                (isUpdating || isBillingContactValid)
                            }
                            anyProductChanged={true}
                            anyNewProductSelected={true}
                            anyDowngradedPlanSelected={
                                !!anyDowngradedPlanSelected
                            }
                            periodEnd={''}
                            updateSubscription={handleSubmit}
                            isSubscriptionUpdating={isSubmitting}
                            ctaText={`Subscribe now`}
                        />
                    </Card>
                )}
            </div>
        </div>
    )
}

export default PaymentMethodView
