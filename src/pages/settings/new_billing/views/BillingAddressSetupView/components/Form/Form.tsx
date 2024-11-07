import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {FormEventHandler, HTMLProps, useRef} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'
import {useEmailInputField} from 'pages/settings/new_billing/components/EmailInputField/useEmailInputField'
import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import {useSubmitBillingAddress} from 'pages/settings/new_billing/views/BillingAddressSetupView/hooks/useSubmitBillingAddress'
import {BillingContact} from 'state/billing/types'

import css from './Form.less'

export const Form: React.FC<
    Omit<HTMLProps<HTMLFormElement>, 'onSubmit' | 'onChange' | 'ref'>
> = ({children, ...props}) => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

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
                    {isTaxIdFieldEnabled
                        ? 'Save Billing Information'
                        : ' Set Address'}
                </Button>
                {addressElement.error ? (
                    <Caption error={addressElement.error} />
                ) : null}
            </div>
        </form>
    )
}
