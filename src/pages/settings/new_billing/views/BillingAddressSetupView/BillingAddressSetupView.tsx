import React from 'react'
import {StripeAddressElement} from '../../components/StripeAddressElement/StripeAddressElement'
import {StripeElementsProvider} from '../../components/StripeElementsProvider/StripeElementsProvider'
import BackLink from '../../components/BackLink/BackLink'

import css from './BillingAddressSetupView.less'
import {Form} from './components/Form'
import {EmailInputField} from './components/EmailInputField'

export const BillingAddressSetupView: React.FC = () => {
    return (
        <StripeElementsProvider>
            <Form>
                <BackLink />
                <div className={css.container}>
                    <h1 className={css.title}>Billing Information</h1>
                    <EmailInputField />
                    <StripeAddressElement />
                </div>
            </Form>
        </StripeElementsProvider>
    )
}
