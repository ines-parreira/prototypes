import React, { useEffect, useState } from 'react'

import { useWatch } from 'react-hook-form'

import { Box } from '@gorgias/axiom'
import { useSynthesizeSpeechPreview } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import { VoiceMessageTextToSpeech } from 'models/integration/types'

import { DEFAULT_TTS_LANGUAGE } from './constants'
import { useTextToSpeechContext } from './TextToSpeechContext'
import TTSPreviewButton, { AudioState } from './TTSPreviewButton'

type Props = {
    fieldName: string
}

const VoiceMessageTTSPreviewButton = ({ fieldName }: Props): JSX.Element => {
    const [audioState, setAudioState] = useState<AudioState>(AudioState.NEW)
    const value: VoiceMessageTextToSpeech = useWatch({ name: fieldName })
    const src = value.text_to_speech_recording_file_path || ''

    const notify = useNotify()
    const { integrationId } = useTextToSpeechContext()

    const { mutate: generatePreview } = useSynthesizeSpeechPreview({
        mutation: {
            onError: () => {
                setAudioState(AudioState.NEW)
                void notify.error('Failed to generate voice preview.')
            },
        },
    })

    const handleButtonClick = async () => {
        // generate new preview if none exists & we have text to synthesize
        if (!src && value.text_to_speech_content) {
            generatePreview({
                integrationId: integrationId,
                data: {
                    language_code: value.language ?? DEFAULT_TTS_LANGUAGE,
                    voice_gender: value.gender ?? DEFAULT_TTS_LANGUAGE,
                    property_url: fieldName,
                    text: value.text_to_speech_content,
                },
            })
        }
    }

    useEffect(() => {
        // automatically play the audio once the src is available
        if (src && audioState === AudioState.LOADING) {
            setAudioState(AudioState.PLAYING)
        }
    }, [src, audioState, setAudioState])

    // Reset button state if TTS parameters change
    useEffect(() => {
        setAudioState(AudioState.NEW)
    }, [
        value.text_to_speech_content,
        value.language,
        value.gender,
        setAudioState,
    ])

    return (
        <Box w="100px" justifyContent="flex-end">
            <TTSPreviewButton
                src={src}
                audioState={audioState}
                setAudioState={setAudioState}
                onLoad={handleButtonClick}
                isDisabled={!value.text_to_speech_content}
            />
        </Box>
    )
}

export default VoiceMessageTTSPreviewButton
