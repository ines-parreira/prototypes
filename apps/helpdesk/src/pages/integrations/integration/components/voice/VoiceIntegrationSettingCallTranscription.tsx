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
                label="Call recording"
            >
                {(field) => <NewToggleField {...field} />}
            </FormField>
            <FormField
                name="meta.preferences.transcribe.voicemails"
                label="Voicemail"
            >
                {(field) => <NewToggleField {...field} />}
            </FormField>
        </>
    )
}

export default VoiceIntegrationSettingCallTranscription
