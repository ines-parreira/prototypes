import { PhoneIntegration } from '@gorgias/api-client'

import { Form } from 'core/forms'

import {
    getDefaultValues,
    validateOnboardingForm,
} from './useVoiceOnboardingForm'

import css from './VoiceIntegrationOnboardingForm.less'

type VoiceIntegrationOnboardingFormProps = {
    children: React.ReactNode
}
const VoiceIntegrationOnboardingForm = ({
    children,
}: VoiceIntegrationOnboardingFormProps) => {
    return (
        <Form<PhoneIntegration>
            defaultValues={getDefaultValues()}
            validator={validateOnboardingForm}
            onValidSubmit={() => {}}
        >
            <div className={css.formContainer}>{children}</div>
        </Form>
    )
}

export default VoiceIntegrationOnboardingForm
