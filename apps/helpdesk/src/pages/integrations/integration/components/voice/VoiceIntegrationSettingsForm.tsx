import { FeatureFlagKey } from '@repo/feature-flags'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import { PhoneIntegration } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
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
import VoiceIntegrationSettingsFormCallFlowSection from './VoiceIntegrationSettingsFormCallFlowSection'
import VoiceIntegrationSettingsFormGeneralSection from './VoiceIntegrationSettingsFormGeneralSection'

import css from './VoiceIntegrationSettingsForm.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsForm({ integration }: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)
    const { isDeleting, performDelete } = useDeletePhoneIntegration(integration)
    const useExtendedCallFlows = useFlag(FeatureFlagKey.ExtendedCallFlows)

    return (
        <>
            {useExtendedCallFlows ? (
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
                            <SettingsCardTitle>
                                Call recording
                            </SettingsCardTitle>
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
            ) : (
                <div className={css.container}>
                    <div className={css.section}>
                        <h2>General</h2>
                        <VoiceIntegrationSettingsFormGeneralSection
                            integration={integration}
                        />
                    </div>
                    <div className={css.section}>
                        <div>
                            <h2>Call settings</h2>
                            <p className={css.sectionDescription}>
                                Configure how incoming calls are handled
                            </p>
                        </div>
                        <VoiceIntegrationSettingsFormCallFlowSection />
                    </div>
                </div>
            )}
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
        </>
    )
}

export default VoiceIntegrationSettingsForm
