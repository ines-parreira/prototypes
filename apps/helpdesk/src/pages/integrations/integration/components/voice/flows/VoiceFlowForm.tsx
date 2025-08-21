import omit from 'lodash/omit'

import { PhoneIntegration } from '@gorgias/helpdesk-types'
import { validateCallRoutingFlow } from '@gorgias/helpdesk-validators'

import { Form, toFormErrors } from 'core/forms'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

import GenericVoiceFormSubmitButton from '../VoiceFormSubmitButton'
import { VoiceFlowFormValues } from './types'
import { useVoiceFlowForm } from './utils/useVoiceFlowForm'

import css from './VoiceFlowForm.less'

type VoiceFlowFormProps = {
    integration: PhoneIntegration
    children: React.ReactNode
    defaultValues?: VoiceFlowFormValues
}

function VoiceFlowForm({
    integration,
    children,
    defaultValues,
}: VoiceFlowFormProps) {
    const { getDefaultValues, onSubmit } = useVoiceFlowForm(integration)

    return (
        <Form
            onValidSubmit={onSubmit}
            defaultValues={defaultValues ?? getDefaultValues()}
            mode="onChange"
            resetOptions={{
                keepDirty: false,
                keepDefaultValues: false,
                keepDirtyValues: false,
            }}
            validator={(values: VoiceFlowFormValues) => {
                return toFormErrors(
                    validateCallRoutingFlow(
                        omit(values, ['business_hours_id']),
                    ),
                )
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
