import React from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useFormContext } from 'react-hook-form'
import { Label } from 'reactstrap'

import { VoiceMessage, VoiceMessageType } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { FormField } from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import settingsCss from 'pages/settings/settings.less'

import { FormValues } from './useVoicePreferencesForm'
import VoiceMessageField from './VoiceMessageField'

import css from './VoiceIntegrationPreferences.less'

export default function VoiceIntegrationPreferencesCallRecordings(): JSX.Element {
    const showCustomRecordingNotificationSection: boolean | undefined =
        useFlags()[FeatureFlagKey.CustomRecordingNotification]

    const {
        watch,
        formState: { defaultValues },
    } = useFormContext<FormValues>()
    const [isRecordingInboundCalls, isRecordingOutboundCalls] = watch([
        'meta.preferences.record_inbound_calls',
        'meta.preferences.record_outbound_calls',
    ])

    const isCustomRecordingNotificationDisabled =
        !isRecordingInboundCalls && !isRecordingOutboundCalls

    return (
        <div className={css.callRecordingFormSection}>
            <div>
                <h2
                    className={classNames(
                        settingsCss.headingSection,
                        css.sectionHeader,
                    )}
                >
                    Call Recording
                </h2>
                <p>Automatically record and store all customer calls.</p>
            </div>
            <div>
                <Label className="control-label">Inbound calls</Label>
                <FormField
                    field={ToggleInputField}
                    name="meta.preferences.record_inbound_calls"
                >
                    Start recording automatically
                </FormField>
            </div>
            <div>
                <Label className="control-label">Outbound calls</Label>
                <FormField
                    field={ToggleInputField}
                    name="meta.preferences.record_outbound_calls"
                >
                    Start recording automatically
                </FormField>
            </div>
            {showCustomRecordingNotificationSection && (
                <div>
                    <Label className="control-label">
                        Call recording notifications
                    </Label>
                    <FormField
                        field={VoiceMessageField}
                        name="meta.recording_notification"
                        allowNone
                        horizontal={true}
                        isDisabled={isCustomRecordingNotificationDisabled}
                        validation={{
                            validate: {
                                textToSpeech: (value: VoiceMessage) => {
                                    if (isCustomRecordingNotificationDisabled) {
                                        return undefined
                                    }

                                    if (
                                        value?.voice_message_type ===
                                            VoiceMessageType.TextToSpeech &&
                                        !value?.text_to_speech_content
                                    ) {
                                        return 'Text to speech content is required'
                                    }
                                },
                                voiceRecording: (value: VoiceMessage) => {
                                    if (isCustomRecordingNotificationDisabled) {
                                        return undefined
                                    }

                                    if (
                                        value?.voice_message_type ===
                                            VoiceMessageType.VoiceRecording &&
                                        !value.new_voice_recording_file &&
                                        !defaultValues?.meta
                                            ?.recording_notification
                                            ?.voice_recording_file_path
                                    ) {
                                        return 'Voice recording is required'
                                    }
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    )
}
