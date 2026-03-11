import { useCallback, useState } from 'react'

import { useFormContext } from 'react-hook-form'

import type { DomainEvent } from '@gorgias/events'
import { isDomainEvent } from '@gorgias/events'
import type { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'
import { useChannel } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { DEFAULT_TTS_GENDER, DEFAULT_TTS_LANGUAGE } from './constants'
import TextToSpeechContext from './TextToSpeechContext'

export default function TextToSpeechProvider({
    integrationId,
    children,
}: {
    integrationId: number
    children: React.ReactNode
}) {
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)
    const notify = useNotify()
    const [lastSelectedLanguage, setLastSelectedLanguage] =
        useState<VoiceLanguage>(DEFAULT_TTS_LANGUAGE)
    const [lastSelectedGender, setLastSelectedGender] =
        useState<VoiceGender>(DEFAULT_TTS_GENDER)

    const { watch, setValue } = useFormContext()

    const handleTTSEvent = useCallback(
        (event: DomainEvent) => {
            if (
                isDomainEvent(
                    event,
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized',
                ) ||
                isDomainEvent(
                    event,
                    '//helpdesk/phone.voice-tts.preview.step-property-synthesized',
                )
            ) {
                const {
                    tts_url,
                    text,
                    property_url,
                    language_code,
                    voice_gender,
                    error_message,
                } = event.data

                if (error_message) {
                    void notify.error(
                        `Failed to generate voice preview: ${error_message}`,
                    )
                    return
                }

                const currentValues = watch(property_url)
                if (
                    currentValues.text_to_speech_content !== text ||
                    currentValues.language !== language_code ||
                    currentValues.gender !== voice_gender
                ) {
                    // The text has changed since the request was made; ignore this result
                    return
                }

                setValue(
                    `${property_url}.text_to_speech_recording_file_path`,
                    tts_url,
                )
            }
        },
        [setValue, notify, watch],
    )

    useChannel({
        channel: {
            name: 'user',
            accountId,
            userId,
        },
        onEvent: handleTTSEvent,
    })

    return (
        <TextToSpeechContext.Provider
            value={{
                integrationId,
                lastSelectedLanguage,
                setLastSelectedLanguage,
                lastSelectedGender,
                setLastSelectedGender,
            }}
        >
            {children}
        </TextToSpeechContext.Provider>
    )
}
