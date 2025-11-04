import { Banner, LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { FormField } from 'core/forms'

import css from './VoiceIntegrationSettingCallTranscription_DEPRECATED.less'

function VoiceIntegrationSettingCallTranscription_DEPRECATED() {
    return (
        <div className={css.container}>
            <Banner type="info">
                Transcriptions are available in English, French, German, and
                Spanish; summaries are in English only.
            </Banner>
            <div className={css.sectionData}>
                <FormField
                    name="meta.preferences.transcribe.recordings"
                    field={ToggleField}
                    label="Call recording"
                />
                <FormField
                    name="meta.preferences.transcribe.voicemails"
                    field={ToggleField}
                    label="Voicemail"
                />
            </div>
        </div>
    )
}

export default VoiceIntegrationSettingCallTranscription_DEPRECATED
