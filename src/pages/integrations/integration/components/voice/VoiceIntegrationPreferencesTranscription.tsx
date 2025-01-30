import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {FormField} from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import settingsCss from 'pages/settings/settings.less'

import css from './VoiceIntegrationPreferences.less'

export default function VoiceIntegrationPreferencesTranscription(): JSX.Element {
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
                {useFlags()[FeatureFlagKey.SummarizeCalls] ? (
                    <p>
                        Automatically transcribes and summarizes recorded calls
                        and/or voicemails for quick reference and easy
                        follow-up. Transcriptions are generated for English,
                        French, German and Spanish, summaries are only generated
                        in English.
                    </p>
                ) : (
                    <p>
                        Use speech-to-text to transcribe all recorded calls
                        and/or voicemails
                    </p>
                )}
            </div>
            <FormField
                name="meta.preferences.transcribe.recordings"
                field={ToggleInputField}
            >
                Call recording transcription
            </FormField>
            <FormField
                name="meta.preferences.transcribe.voicemails"
                field={ToggleInputField}
            >
                Voicemail transcription
            </FormField>
        </div>
    )
}
