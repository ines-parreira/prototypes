import { useState } from 'react'

import { FormField } from '@repo/forms'

import { LegacyBanner as Banner } from '@gorgias/axiom'

import NewToggleField from 'pages/common/forms/NewToggleField'

function VoiceIntegrationSettingCallTranscription() {
    const [isBannerVisible, setIsBannerVisible] = useState(true)

    return (
        <>
            {isBannerVisible && (
                <Banner
                    type="info"
                    isClosable={true}
                    onClose={() => setIsBannerVisible(false)}
                >
                    Transcripts are available in more than{' '}
                    <a
                        href="https://link.gorgias.com/b87a76"
                        rel="noreferrer"
                        target="_blank"
                    >
                        50 languages
                    </a>
                    ; summaries are in English only.
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

export default VoiceIntegrationSettingCallTranscription
