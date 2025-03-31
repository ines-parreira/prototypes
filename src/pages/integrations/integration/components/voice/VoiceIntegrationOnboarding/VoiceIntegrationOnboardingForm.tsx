import { Form } from 'core/forms'

import { getDefaultValues } from './useVoiceOnboardingForm'

import css from './VoiceIntegrationOnboardingForm.less'

type VoiceIntegrationOnboardingFormProps = {
    children: React.ReactNode
}
const VoiceIntegrationOnboardingForm = ({
    children,
}: VoiceIntegrationOnboardingFormProps) => {
    const values = getDefaultValues()

    return (
        <Form values={values} onValidSubmit={() => {}}>
            <div className={css.formContainer}>{children}</div>
        </Form>
    )
}

export default VoiceIntegrationOnboardingForm
