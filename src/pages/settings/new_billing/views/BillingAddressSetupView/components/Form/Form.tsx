import React, {FormEventHandler, HTMLProps, useRef} from 'react'
import Button from 'pages/common/components/button/Button'
import {BillingContact} from 'state/billing/types'
import Caption from 'pages/common/forms/Caption/Caption'
import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import {useSubmitBillingAddress} from '../../hooks/useSubmitBillingAddress'
import {useEmailInputField} from '../EmailInputField/useEmailInputField'
import css from './Form.less'

export const Form: React.FC<
    Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'onChange' | 'ref'>
> = ({children, ...props}) => {
    const formRef = useRef<HTMLFormElement>(null)

    const addressElement = useStripeAddressElement()
    const emailField = useEmailInputField(formRef.current)

    const isComplete = addressElement.isComplete && emailField.isComplete

    const submitBillingAddress = useSubmitBillingAddress()

    const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault()

        if (isComplete) {
            const billingContact = {
                email: emailField.getValue(),
                shipping: addressElement.getValue(),
            } as BillingContact

            submitBillingAddress.mutate([billingContact])
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit} className={css.form} {...props}>
            {children}
            <div>
                <Button
                    intent="primary"
                    isDisabled={!isComplete}
                    type="submit"
                    className={css.submitButton}
                    isLoading={submitBillingAddress.isLoading}
                >
                    Set Address
                </Button>
                {addressElement.error ? (
                    <Caption error={addressElement.error} />
                ) : null}
            </div>
        </form>
    )
}
