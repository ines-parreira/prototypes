import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
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
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import usePhoneNumbers from 'pages/integrations/integration/components/phone/usePhoneNumbers'
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
import VoiceIntegrationSettingSpamPrevention from './VoiceIntegrationSettingSpamPrevention'
import TextToSpeechProvider from './VoiceMessageTTS/TextToSpeechProvider'

import css from './VoiceIntegrationSettingsForm.less'

type Props = {
    integration: PhoneIntegration
}

function VoiceIntegrationSettingsForm({ integration }: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)
    const { isDeleting, performDelete } = useDeletePhoneIntegration(integration)
    const useVoiceSpamDetection = useFlag(FeatureFlagKey.UseVoiceSpamDetection)

    const { getCountryFromPhoneNumberId } = usePhoneNumbers()
    const phoneNumberCountry = integration.meta.phone_number_id
        ? getCountryFromPhoneNumberId(integration.meta.phone_number_id)
        : undefined
    const isUsPhoneNumber = phoneNumberCountry === 'US'

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
                {useVoiceSpamDetection && isUsPhoneNumber && (
                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>
                                Spam prevention{' '}
                                <IconTooltip
                                    tooltipProps={{
                                        placement: 'top-start',
                                        autohide: false,
                                    }}
                                >
                                    Spam status comes from Twilio&apos;s
                                    STIR/SHAKEN rating. Accuracy may vary — some
                                    calls might lack a rating, and legitimate
                                    ones could appear low-rated.{' '}
                                    <a
                                        href="https://link.gorgias.com/556d1f"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Find out more.
                                    </a>
                                </IconTooltip>
                            </SettingsCardTitle>
                            Decide if you want agents to be warned that some
                            calls might be spam
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            <VoiceIntegrationSettingSpamPrevention />
                        </SettingsCardContent>
                    </SettingsCard>
                )}
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
