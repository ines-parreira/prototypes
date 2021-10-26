import {AxiosError} from 'axios'

import {RootState, StoreDispatch} from '../../../../../state/types'
import * as integrationSelectors from '../../../../../state/integrations/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {fetchIntegration} from '../../../../../state/integrations/actions'
import * as constants from '../../../../../state/integrations/constants.js'
import {IntegrationType} from '../../../../../models/integration/types'
import client from '../../../../../models/api/resources'

import {VoiceMailType} from './PhoneIntegrationVoicemail'
import {GreetingMessageType} from './PhoneIntegrationGreetingMessage'

enum VoiceMessagePaths {
    VoiceMail = 'voicemail-preferences',
    GreetingMessage = 'greeting-message',
}

type UpdateVoiceMessagePayload = {
    text_to_speech_content?: string | null
    new_voice_recording_file?: string | null
    new_voice_recording_file_name?: string | null
    new_voice_recording_file_type?: string | null
}

export type UpdateVoicemailPayload = UpdateVoiceMessagePayload & {
    voice_message_type: VoiceMailType | null
    allow_to_leave_voicemail: boolean
}

export type UpdateGreetingMessagePayload = UpdateVoiceMessagePayload & {
    voice_message_type: GreetingMessageType | null
}

type UpdatePayload = UpdateVoicemailPayload | UpdateGreetingMessagePayload

export const updatePhoneVoicemailConfiguration = (
    payload: UpdateVoicemailPayload
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const path = VoiceMessagePaths.VoiceMail

    return updatePhoneVoiceMessageConfiguration(payload, path)(
        dispatch,
        getState
    )
}

export const updatePhoneGreetingMessageConfiguration = (
    payload: UpdateGreetingMessagePayload
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const path = VoiceMessagePaths.GreetingMessage

    return updatePhoneVoiceMessageConfiguration(payload, path)(
        dispatch,
        getState
    )
}

const updatePhoneVoiceMessageConfiguration = (
    payload: UpdatePayload,
    path: string
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const state = getState()
    const integrationId = integrationSelectors
        .getCurrentIntegration(state)
        .get('id') as number

    return client
        .put(`/integrations/phone/${integrationId}/${path}/`, payload)
        .then(
            () => {
                void fetchIntegration(
                    integrationId.toString(),
                    IntegrationType.Phone
                )(dispatch)
                return dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message:
                            'Voicemail configuration successfully updated.',
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.UPDATE_INTEGRATION_ERROR,
                    error,
                    verbose: true,
                })
            }
        )
}
