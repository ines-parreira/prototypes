import classNames from 'classnames'

import { ToggleField } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import settingsCss from 'pages/settings/settings.less'

import css from './VoiceIntegrationPreferences.less'

export default function VoiceIntegrationPreferencesTranscription(): JSX.Element {
    return (
        <div className={css.transcriptionFormSection}>
            <div>
                <h2
                    className={classNames(
                        settingsCss.headingSection,
                        css.sectionHeader,
                    )}
                >
                    Transcription
                </h2>
                <p>
                    Automatically transcribes and summarizes recorded calls
                    and/or voicemails for quick reference and easy follow-up.
                    Transcriptions are generated for English, French, German and
                    Spanish, summaries are only generated in English.
                </p>
            </div>
            <FormField
                name="meta.preferences.transcribe.recordings"
                field={ToggleField}
                label="Call recording transcription"
            />
            <FormField
                name="meta.preferences.transcribe.voicemails"
                field={ToggleField}
                label="Voicemail transcription"
            />
        </div>
    )
}
