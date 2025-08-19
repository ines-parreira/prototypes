import { CallRoutingFlow, PhoneIntegration } from '@gorgias/helpdesk-types'
import { validateCallRoutingFlow } from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

import GenericVoiceFormSubmitButton from '../VoiceFormSubmitButton'
import { useVoiceFlowForm } from './utils/useVoiceFlowForm'

import css from './VoiceFlowForm.less'

type VoiceFlowFormProps = {
    integration: PhoneIntegration
    children: React.ReactNode
}

function VoiceFlowForm({ integration, children }: VoiceFlowFormProps) {
    const { getDefaultValues, onSubmit } = useVoiceFlowForm(integration)

    return (
        <Form
            onValidSubmit={onSubmit}
            defaultValues={getDefaultValues()}
            mode="onChange"
            resetOptions={{
                keepDirty: false,
                keepDefaultValues: false,
                keepDirtyValues: false,
            }}
            validator={(values: CallRoutingFlow) => {
                return toFormErrors(validateCallRoutingFlow(values))
            }}
        >
            <div className={css.buttonsBanner}>
                <GenericVoiceFormSubmitButton>
                    Save changes
                </GenericVoiceFormSubmitButton>
            </div>
            <FormUnsavedChangesPrompt onSave={onSubmit} />
            {children}
        </Form>
    )
}
export default VoiceFlowForm
