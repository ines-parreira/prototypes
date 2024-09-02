import React from 'react'
import classNames from 'classnames'
import {PhoneIntegrationPreferences} from 'models/integration/types'
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from 'pages/settings/settings.less'
import css from './VoiceIntegrationPreferences.less'

type Props = {
    preferences: PhoneIntegrationPreferences
    onPreferencesChange: (
        preferences: Partial<PhoneIntegrationPreferences>
    ) => void
}

export default function VoiceIntegrationPreferencesTranscription({
    preferences,
    onPreferencesChange,
}: Props): JSX.Element {
    const defaultTranscribePreferences = {
        voicemails: false,
        recordings: false,
    }
    return (
        <div className={css.transcriptionFormSection}>
            <div>
                <h2
                    className={classNames(
                        settingsCss.headingSection,
                        css.sectionHeader
                    )}
                >
                    Transcription
                </h2>
                <p>
                    Use speech-to-text to transcribe all recorded calls and/or
                    voicemails
                </p>
            </div>
            <ToggleInput
                isToggled={preferences.transcribe?.recordings ?? false}
                onClick={(value) =>
                    onPreferencesChange({
                        ...preferences,
                        transcribe: {
                            ...(preferences.transcribe ??
                                defaultTranscribePreferences),
                            recordings: value,
                        },
                    })
                }
            >
                Call recording transcription
            </ToggleInput>
            <ToggleInput
                isToggled={preferences.transcribe?.voicemails ?? false}
                onClick={(value) =>
                    onPreferencesChange({
                        ...preferences,
                        transcribe: {
                            ...(preferences.transcribe ??
                                defaultTranscribePreferences),
                            voicemails: value,
                        },
                    })
                }
            >
                Voicemail transcription
            </ToggleInput>
        </div>
    )
}
