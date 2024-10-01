import React, {useState} from 'react'
import InputField from 'pages/common/forms/input/InputField'
import {emailError} from 'pages/settings/new_billing/utils/validations'
import useAppSelector from 'hooks/useAppSelector'
import {getContactEmail} from 'state/billing/selectors'

export const EmailInputField: React.FC = () => {
    const billingContactEmail = useAppSelector(getContactEmail)

    const [email, setEmail] = useState<string>(billingContactEmail)

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
