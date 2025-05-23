import { PhoneIntegration } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'

import { DEFAULT_PHONE_ONBOARDING_VALUES } from './constants'
import {
    useOnboardingForm,
    validateOnboardingForm,
} from './useVoiceOnboardingForm'

import css from './VoiceIntegrationOnboardingForm.less'

type VoiceIntegrationOnboardingFormProps = {
    children: React.ReactNode
}

const VoiceIntegrationOnboardingForm = ({
    children,
}: VoiceIntegrationOnboardingFormProps) => {
    const { onSubmit } = useOnboardingForm()

    return (
        <Form<PhoneIntegration>
            defaultValues={DEFAULT_PHONE_ONBOARDING_VALUES}
            validator={validateOnboardingForm}
            onValidSubmit={onSubmit}
        >
            <div className={css.formContainer}>{children}</div>
        </Form>
    )
}

export default VoiceIntegrationOnboardingForm
