import React, {useEffect, useState} from 'react'

import {useBillingContact} from 'models/billing/queries'
import InputField from 'pages/common/forms/input/InputField'
import {emailError} from 'pages/settings/new_billing/utils/validations'

export const EmailInputField: React.FC = () => {
    const {data: {data: {email: billingContactEmail}} = {data: {}}} =
        useBillingContact({staleTime: Infinity})

    const [email, setEmail] = useState<string>(billingContactEmail ?? '')

    useEffect(() => {
        setEmail(billingContactEmail ?? '')
    }, [billingContactEmail])

    const emailErrorMsg = emailError(email)

    return (
        <InputField
            caption="Invoices are sent to this email address."
            label="Email"
            name="email"
            placeholder="your@email.com"
            isRequired
            type="email"
            value={email}
            error={emailErrorMsg}
            onChange={setEmail}
        />
    )
}
