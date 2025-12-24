import { useState } from 'react'

import { FormField } from '@repo/forms'

import { LegacyBanner as Banner } from '@gorgias/axiom'

import NewToggleField from 'pages/common/forms/NewToggleField'

function VoiceIntegrationSettingCallTranscription_DEPRECATED() {
    const [isBannerVisible, setIsBannerVisible] = useState(true)
    return (
        <>
            {isBannerVisible && (
                <Banner
                    type="info"
                    isClosable={true}
                    onClose={() => setIsBannerVisible(false)}
                >
                    Transcriptions are available in English, French, German, and
                    Spanish; summaries are in English only.
                </Banner>
            )}
            <FormField
                name="meta.preferences.transcribe.recordings"
                field={NewToggleField}
                label="Call recording"
            />
            <FormField
                name="meta.preferences.transcribe.voicemails"
                field={NewToggleField}
                label="Voicemail"
            />
        </>
    )
}

export default VoiceIntegrationSettingCallTranscription_DEPRECATED
