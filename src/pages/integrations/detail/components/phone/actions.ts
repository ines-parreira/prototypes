import {AxiosError} from 'axios'

import {RootState, StoreDispatch} from '../../../../../state/types'
import * as integrationSelectors from '../../../../../state/integrations/selectors'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {fetchIntegration} from '../../../../../state/integrations/actions'
import * as constants from '../../../../../state/integrations/constants'
import {
    IntegrationType,
    VoiceMessage,
    PhoneIntegrationIvrSettings,
    PhoneIntegrationVoicemailSettings,
} from '../../../../../models/integration/types'
import client from '../../../../../models/api/resources'

export const updatePhoneVoicemailConfiguration =
    (payload: Partial<PhoneIntegrationVoicemailSettings>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integrationId = integrationSelectors
            .getCurrentIntegration(state)
            .get('id') as number

        return client
            .put(
                `/integrations/phone/${integrationId}/voicemail-preferences/`,
                payload
            )
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

export const updatePhoneGreetingMessageConfiguration =
    (payload: Partial<VoiceMessage>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integrationId = integrationSelectors
            .getCurrentIntegration(state)
            .get('id') as number

        return client
            .put(
                `/integrations/phone/${integrationId}/greeting-message/`,
                payload
            )
            .then(
                () => {
                    void fetchIntegration(
                        integrationId.toString(),
                        IntegrationType.Phone
                    )(dispatch)
                    return dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Greeting message successfully updated.',
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

export const updatePhoneIvrConfiguration =
    (payload: Partial<PhoneIntegrationIvrSettings>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integrationId = integrationSelectors
            .getCurrentIntegration(state)
            .get('id') as number

        return client
            .put(`/integrations/phone/${integrationId}/ivr/`, payload)
            .then(
                () => {
                    void fetchIntegration(
                        integrationId.toString(),
                        IntegrationType.Phone
                    )(dispatch)
                    return dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'IVR configuration successfully updated.',
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
