import React, { useRef, useState } from 'react'

import { Button } from '@gorgias/axiom'
import { useSynthesizeSpeechPreview } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import { VoiceMessageTextToSpeech } from 'models/integration/types'
import { replaceAttachmentURL } from 'utils'

import { DEFAULT_TTS_LANGUAGE } from './constants'
import { useTextToSpeechContext } from './TextToSpeechContext'

type Props = {
    fieldName: string
    value: VoiceMessageTextToSpeech
}

const VoiceMessageTTSPreviewButton = ({
    fieldName,
    value,
}: Props): JSX.Element => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPaused, setIsPaused] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const src = value.text_to_speech_recording_file_path || ''

    const notify = useNotify()
    const { integrationId } = useTextToSpeechContext()

    const { mutate: generatePreview } = useSynthesizeSpeechPreview({
        mutation: {
            onError: () => {
                setIsGenerating(false)
                void notify.error('Failed to generate voice preview.')
            },
        },
    })

    const playOrPause = async (event: React.MouseEvent) => {
        event.stopPropagation()
        if (!src && value.text_to_speech_content) {
            setIsGenerating(true)
            generatePreview({
                integrationId: integrationId,
                data: {
                    language_code: value.language ?? DEFAULT_TTS_LANGUAGE,
                    voice_gender: value.gender ?? DEFAULT_TTS_LANGUAGE,
                    property_url: fieldName,
                    text: value.text_to_speech_content,
                },
            })
            return
        }

        const audio = audioRef.current
        if (!audio) {
            return
        }
        if (audio.paused) {
            await audio.play()
        } else {
            audio.pause()
        }
    }

    return (
        <div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                hidden
                src={replaceAttachmentURL(src)}
                ref={audioRef}
                loop={false}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
            />
            <Button
                variant="secondary"
                onClick={playOrPause}
                leadingSlot={
                    <i className="material-icons" style={{ fontSize: '20px' }}>
                        {isPaused
                            ? isGenerating
                                ? 'downloading'
                                : 'play_arrow'
                            : 'pause'}
                    </i>
                }
                isDisabled={isGenerating || !value.text_to_speech_content}
            >
                Preview
            </Button>
        </div>
    )
}

export default VoiceMessageTTSPreviewButton
