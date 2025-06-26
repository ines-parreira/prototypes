import { useEffect } from 'react'

import { useFormContext } from 'react-hook-form'

import { PhoneIntegration } from '@gorgias/helpdesk-types'
import { CheckBoxField } from '@gorgias/merchant-ui-kit'

import { FormField, FormSubmitButton } from 'core/forms'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationIVRPreferences.less'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from './useVoiceSettingsForm'
import VoiceIntegrationSettingsFormGeneralSection from './VoiceIntegrationSettingsFormGeneralSection'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationIVRPreferencesForm({
    integration,
}: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)
    const { isDeleting, performDelete } = useDeletePhoneIntegration(integration)

    const methods = useFormContext()
    const {
        formState: { isValid, isDirty, isSubmitting },
        register,
    } = methods

    useEffect(() => {
        register('meta.emoji')
    }, [register])

    return (
        <div className={css.container}>
            <VoiceIntegrationSettingsFormGeneralSection
                integration={integration}
            />

            <div className={css.section}>
                <h2>Routing options</h2>
                <FormField
                    name="meta.preferences.voicemail_outside_business_hours"
                    field={CheckBoxField}
                    label="Send calls to voicemail outside business hours"
                    caption="If a customer calls outside of
                                                    business hours, they will be
                                                    immediately forwarded to voicemail."
                />
            </div>

            <div>
                <FormSubmitButton
                    type="submit"
                    isDisabled={!isValid || !isDirty}
                    isLoading={isSubmitting}
                >
                    Save changes
                </FormSubmitButton>
                <ConfirmButton
                    className="float-right"
                    intent="destructive"
                    fillStyle="ghost"
                    isLoading={isDeleting}
                    onConfirm={() => performDelete({ id: integration.id })}
                    confirmationContent={INTEGRATION_REMOVAL_CONFIGURATION_TEXT}
                    leadingIcon="delete"
                >
                    Delete integration
                </ConfirmButton>
            </div>
            <FormUnsavedChangesPrompt onSave={onSubmit} />
        </div>
    )
}
