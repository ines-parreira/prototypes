import { Banner } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'

import css from './VoiceIntegrationSettingCallTranscription.less'

function VoiceIntegrationSettingCallTranscription() {
    return (
        <div className={css.container}>
            <Banner type="info">
                Transcriptions are available in English, French, German, and
                Spanish; summaries are in English only.
            </Banner>
            <div className={css.sectionData}>
                <FormField
                    name="meta.preferences.transcribe.recordings"
                    field={ToggleInputField}
                >
                    Call recording
                </FormField>
                <FormField
                    name="meta.preferences.transcribe.voicemails"
                    field={ToggleInputField}
                >
                    Voicemail
                </FormField>
            </div>
        </div>
    )
}

export default VoiceIntegrationSettingCallTranscription
