import { emailError } from '@repo/billing'

import { FormInputField } from 'pages/settings/new_billing/components/FormInputField/FormInputField'

export const EmailField: React.FC = () => (
    <FormInputField
        type="text"
        name="email"
        label="Email"
        placeholder="your@email.com"
        caption="Invoices are sent to this email address."
        rules={{
            validate: (value?: string) =>
                !value?.length
                    ? 'This field is incomplete.'
                    : (emailError(value) ?? true),
        }}
    />
)
