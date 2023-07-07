import React from 'react'

import {Form} from 'reactstrap'
import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import BackLink from '../../components/BackLink/BackLink'
import {useCreditCard} from '../../hooks/useCreditCard'
import AddressForm from '../../components/AddressForm/AddressForm'
import {emailError} from '../../utils/validations'
import css from './CardView.less'
import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from './utils'

const CardView = () => {
    const {
        fields,
        errors,
        isStripeLoaded,
        isDisabled,
        isSubmitting,
        isUpdating,
        handleSubmit,
        updateField,
        billingContact,
        setBillingContact,
        isCreditCardFetched,
        isContactFetched,
    } = useCreditCard()

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
            <BackLink />
            <h3 className={css.title}>Payment method</h3>
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
                                creditCardNormalizer(newNumber, fields.number)
                            )
                        }
                        error={errors.number}
                        data-testid="number"
                    />
                    <InputField
                        className={css.inputRow}
                        id="expDate"
                        label="Expiry date"
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
                                creditCardCVCNormalizer(newCvc, fields.cvc)
                            )
                        }
                        error={errors.cvc}
                        data-testid="cvc"
                    />
                </div>
                <div className={css.disclaimer}>
                    <i className="material-icons-outlined">info</i>
                    <span>
                        <b>A temporary $1 charge</b> will be applied to new
                        payment methods, and be <b>refunded within 7 days.</b>
                    </span>
                </div>
                {!isUpdating && (
                    <AddressForm
                        billingContact={billingContact}
                        setBillingContact={setBillingContact}
                    />
                )}
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={
                        isDisabled || (!isUpdating && !isBillingContactValid)
                    }
                    className={css.submitButton}
                >
                    {isUpdating ? 'Update card' : 'Add payment method'}
                </Button>
            </Form>
        </div>
    )
}

export default CardView
