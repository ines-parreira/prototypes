import {AxiosError} from 'axios'

import {RootState, StoreDispatch} from '../../../../../state/types'
import * as integrationSelectors from '../../../../../state/integrations/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {fetchIntegration} from '../../../../../state/integrations/actions'
import * as constants from '../../../../../state/integrations/constants.js'
import {IntegrationType} from '../../../../../models/integration/types'
import client from '../../../../../models/api/resources'

enum VoiceMessagePaths {
    VoiceMail = 'voicemail-preferences',
    GreetingMessage = 'greeting-message',
}

export const updatePhoneVoicemailConfiguration = (formData: FormData) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const path = VoiceMessagePaths.VoiceMail

    return updatePhoneVoiceMessageConfiguration(formData, path)(
        dispatch,
        getState
    )
}

export const updatePhoneGreetingMessageConfiguration = (formData: FormData) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const path = VoiceMessagePaths.GreetingMessage

    return updatePhoneVoiceMessageConfiguration(formData, path)(
        dispatch,
        getState
    )
}

export const updatePhoneVoiceMessageConfiguration = (
    formData: FormData,
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
        .put(`/integrations/phone/${integrationId}/${path}/`, formData)
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
