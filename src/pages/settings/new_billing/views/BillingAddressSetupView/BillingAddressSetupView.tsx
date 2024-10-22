import React from 'react'
import {useBillingContact} from 'models/billing/queries'
import Loader from 'pages/common/components/Loader/Loader'

import {EmailInputField} from 'pages/settings/new_billing/components/EmailInputField/EmailInputField'
import {StripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/StripeAddressElement'
import {StripeElementsProvider} from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import {Form} from 'pages/settings/new_billing/views/BillingAddressSetupView/components/Form/Form'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import css from './BillingAddressSetupView.less'

export const BillingAddressSetupView: React.FC = () => {
    const billingContact = useBillingContact({refetchOnWindowFocus: false})

    if (billingContact.isLoading) {
        return <Loader />
    }

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
