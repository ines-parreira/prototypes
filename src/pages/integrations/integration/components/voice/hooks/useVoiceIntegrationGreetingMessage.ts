import {
    UpdateWaitMusicPreferences,
    WaitMusicType,
    useUpdateWaitMusicPreferences,
} from '@gorgias/api-queries'
import {useCallback, useEffect, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {DEFAULT_GREETING_MESSAGE} from 'models/integration/constants'
import {
    PhoneIntegration,
    VoiceMessage,
    LocalWaitMusicPreferences,
} from 'models/integration/types'
import {updatePhoneGreetingMessageConfiguration} from 'pages/integrations/integration/components/phone/actions'

import {fetchIntegrations} from 'state/integrations/actions'

import {UPDATE_INTEGRATION_ERROR} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {DEFAULT_WAIT_MUSIC_PREFERENCES} from '../waitMusicLibraryConstants'
import useVoiceMessageValidation from './useVoiceMessageValidation'

export default function useVoiceIntegrationGreetingMessage(
    integration: PhoneIntegration
) {
    const dispatch = useAppDispatch()
    const {areVoiceMessagesTheSame, areWaitMusicPreferencesTheSame} =
        useVoiceMessageValidation()

    const integrationGreetingMessage =
        integration.meta?.greeting_message ?? DEFAULT_GREETING_MESSAGE
    const [greetingMessagePreferences, setGreetingMessagePreferences] =
        useState<VoiceMessage>(integrationGreetingMessage)
    const [greetingMessagePayload, setGreetingMessagePayload] =
        useState<VoiceMessage>(integrationGreetingMessage)

    const integrationWaitMusic =
        integration.meta?.wait_music ?? DEFAULT_WAIT_MUSIC_PREFERENCES
    const [waitMusicPreferences, setWaitMusicPreferences] =
        useState<LocalWaitMusicPreferences>(integrationWaitMusic)
    const [waitMusicPayload, setWaitMusicPayload] =
        useState<LocalWaitMusicPreferences>(integrationWaitMusic)

    const {mutate: updateWaitMusicPreferences, isLoading: isWaitMusicLoading} =
        useUpdateWaitMusicPreferences({
            mutation: {
                onSuccess: () => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Wait music successfully updated.',
                        })
                    )
                    void dispatch(fetchIntegrations())
                },
                onError: (error) => {
                    void dispatch({
                        type: UPDATE_INTEGRATION_ERROR,
                        error,
                        verbose: true,
                    })
                },
            },
        })

    const canSubmitGreetingMessage = useCallback(() => {
        return !areVoiceMessagesTheSame(
            greetingMessagePayload,
            greetingMessagePreferences
        )
    }, [
        areVoiceMessagesTheSame,
        greetingMessagePayload,
        greetingMessagePreferences,
    ])

    const canSubmitWaitMusic = useCallback(() => {
        if (
            waitMusicPayload.type === WaitMusicType.CustomRecording &&
            !waitMusicPayload.custom_recording &&
            !waitMusicPreferences.custom_recording
        ) {
            return false
        }
        if (
            waitMusicPayload.type === WaitMusicType.Library &&
            !waitMusicPayload.library &&
            !waitMusicPreferences.library
        ) {
            return false
        }
        return !areWaitMusicPreferencesTheSame(
            waitMusicPayload,
            waitMusicPreferences
        )
    }, [areWaitMusicPreferencesTheSame, waitMusicPayload, waitMusicPreferences])

    const isSubmittable = canSubmitGreetingMessage() || canSubmitWaitMusic()

    const [isGreetingMessageLoading, setIsGreetingMessageLoading] =
        useState(false)

    useEffect(() => {
        if (
            !areVoiceMessagesTheSame(
                greetingMessagePreferences,
                integrationGreetingMessage
            )
        ) {
            setGreetingMessagePreferences(integrationGreetingMessage)
            setGreetingMessagePayload(integrationGreetingMessage)
        }
        if (
            !areWaitMusicPreferencesTheSame(
                waitMusicPreferences,
                integrationWaitMusic
            )
        ) {
            setWaitMusicPreferences(integrationWaitMusic)
            setWaitMusicPayload(integrationWaitMusic)
        }
    }, [
        greetingMessagePayload,
        setGreetingMessagePayload,
        greetingMessagePreferences,
        setGreetingMessagePreferences,
        areVoiceMessagesTheSame,
        integrationGreetingMessage,
        areWaitMusicPreferencesTheSame,
        waitMusicPreferences,
        integrationWaitMusic,
    ])

    const getWaitMusicUpdatePayload =
        useCallback((): UpdateWaitMusicPreferences => {
            if (
                waitMusicPayload.type === WaitMusicType.CustomRecording &&
                waitMusicPayload.custom_recording &&
                waitMusicPayload.custom_recording.audio_file
            ) {
                return {
                    type: waitMusicPayload.type,
                    custom_recording: {
                        audio_file:
                            waitMusicPayload.custom_recording.audio_file,
                        audio_file_name:
                            waitMusicPayload.custom_recording.audio_file_name,
                        audio_file_type:
                            waitMusicPayload.custom_recording.audio_file_type,
                    },
                }
            }
            if (
                waitMusicPayload.type === WaitMusicType.Library &&
                waitMusicPayload.library &&
                waitMusicPayload.library.key !==
                    waitMusicPreferences.library?.key
            ) {
                return {
                    type: waitMusicPayload.type,
                    library: waitMusicPayload.library,
                }
            }
            return {type: waitMusicPayload.type}
        }, [waitMusicPayload, waitMusicPreferences])

    const makeApiCalls = useCallback(async () => {
        setIsGreetingMessageLoading(true)
        try {
            if (canSubmitGreetingMessage()) {
                await dispatch(
                    updatePhoneGreetingMessageConfiguration(
                        greetingMessagePayload
                    )
                )
                if (!canSubmitWaitMusic()) {
                    void dispatch(fetchIntegrations())
                }
            }
            setIsGreetingMessageLoading(false)
        } catch {
            setIsGreetingMessageLoading(false)
        }

        if (canSubmitWaitMusic()) {
            updateWaitMusicPreferences({
                integrationId: integration.id,
                data: getWaitMusicUpdatePayload(),
            })
        }
    }, [
        canSubmitGreetingMessage,
        canSubmitWaitMusic,
        dispatch,
        getWaitMusicUpdatePayload,
        greetingMessagePayload,
        integration.id,
        updateWaitMusicPreferences,
    ])

    return {
        greetingMessagePayload,
        setGreetingMessagePayload,
        waitMusicPayload,
        setWaitMusicPayload,
        isGreetingMessageLoading,
        isWaitMusicLoading,
        isSubmittable,
        makeApiCalls,
    }
}
