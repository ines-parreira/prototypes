import { useEffect } from 'react'

import { Form, toFormErrors } from '@repo/forms'
import omit from 'lodash/omit'

import type { PhoneIntegration } from '@gorgias/helpdesk-types'
import { validateCallRoutingFlow } from '@gorgias/helpdesk-validators'

import { useNotify } from 'hooks/useNotify'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'

import GenericVoiceFormSubmitButton from '../VoiceFormSubmitButton'
import TextToSpeechProvider from '../VoiceMessageTTS/TextToSpeechProvider'
import { VoiceFlowNodeType } from './constants'
import type { VoiceFlowFormValues } from './types'
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
    const notify = useNotify()

    useEffect(() => {
        if (
            integration.meta.preferences?.record_inbound_calls === true &&
            !Object.values(defaultValues?.steps || {}).some(
                (step) => step.step_type === VoiceFlowNodeType.PlayMessage,
            )
        ) {
            notify.warning(
                'Call recording is enabled for inbound calls. To ensure transparency, consider adding a recording notification to your welcome message.',
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Form
            className={css.formContainer}
            onValidSubmit={onSubmit}
            defaultValues={getDefaultValues(defaultValues)}
            resetOptions={{
                keepDirty: false,
                keepDefaultValues: false,
                keepDirtyValues: false,
            }}
            validator={(values: VoiceFlowFormValues) => {
                try {
                    return toFormErrors(
                        validateCallRoutingFlow(
                            omit(values, [
                                'business_hours_id',
                                'record_inbound_calls',
                            ]),
                        ),
                    )
                } catch {
                    return { steps: 'An unexpected error occurred' }
                }
            }}
        >
            <TextToSpeechProvider integrationId={integration.id}>
                <div className={css.buttonsBanner}>
                    <GenericVoiceFormSubmitButton>
                        Save changes
                    </GenericVoiceFormSubmitButton>
                </div>
                <FormUnsavedChangesPrompt onSave={onSubmit} />
                {children}
            </TextToSpeechProvider>
        </Form>
    )
}
export default VoiceFlowForm
