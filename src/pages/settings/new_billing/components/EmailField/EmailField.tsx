import { FormInputField } from 'pages/settings/new_billing/components/FormInputField/FormInputField'
import { emailError } from 'pages/settings/new_billing/utils/validations'

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
