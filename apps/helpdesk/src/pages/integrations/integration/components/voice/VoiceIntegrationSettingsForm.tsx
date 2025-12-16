import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import FormUnsavedChangesPrompt from 'pages/common/components/FormUnsavedChangesPrompt'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import {
    useDeletePhoneIntegration,
    useFormSubmit,
} from './useVoiceSettingsForm'
import GenericVoiceFormSubmitButton from './VoiceFormSubmitButton'
import VoiceIntegrationSettingCallRecording from './VoiceIntegrationSettingCallRecording'
import VoiceIntegrationSettingCallTranscription from './VoiceIntegrationSettingCallTranscription'
import VoiceIntegrationSettingsFormGeneralSection from './VoiceIntegrationSettingsFormGeneralSection'
import TextToSpeechProvider from './VoiceMessageTTS/TextToSpeechProvider'

import css from './VoiceIntegrationSettingsForm.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsForm({ integration }: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)
    const { isDeleting, performDelete } = useDeletePhoneIntegration(integration)

    return (
        <TextToSpeechProvider integrationId={integration.id}>
            <div className={css.settingsContainer}>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>General</SettingsCardTitle>
                        Edit the name, phone number and business hours
                        associated with your voice integration
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <div className={css.section}>
                            <VoiceIntegrationSettingsFormGeneralSection
                                integration={integration}
                            />
                        </div>
                    </SettingsCardContent>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Call recording</SettingsCardTitle>
                        Toggle call recording on / off
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <VoiceIntegrationSettingCallRecording
                            integrationId={integration.id}
                        />
                    </SettingsCardContent>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>
                            Call transcription
                        </SettingsCardTitle>
                        Toggle automatic call transcription on / off
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <VoiceIntegrationSettingCallTranscription />
                    </SettingsCardContent>
                </SettingsCard>
            </div>
            <div className={css.buttons}>
                <div className={css.mainActions}>
                    <GenericVoiceFormSubmitButton>
                        Save changes
                    </GenericVoiceFormSubmitButton>
                    <Link to={`${PHONE_INTEGRATION_BASE_URL}/integrations`}>
                        <Button intent="secondary">Cancel</Button>
                    </Link>
                </div>
                <ConfirmButton
                    className="float-right"
                    intent="destructive"
                    fillStyle="ghost"
                    isLoading={isDeleting}
                    onConfirm={() => performDelete({ id: integration.id })}
                    confirmationContent={INTEGRATION_REMOVAL_CONFIGURATION_TEXT}
                >
                    Delete integration
                </ConfirmButton>
            </div>
            <FormUnsavedChangesPrompt onSave={onSubmit} />
        </TextToSpeechProvider>
    )
}

export default VoiceIntegrationSettingsForm
