import axios, {AxiosError} from 'axios'

import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'

import {StoreDispatch} from '../types'

import * as constants from './constants'
import {ApiListResponse, SelfServiceConfiguration} from './types'

export function fetchSelfServiceConfiguration(integrationId: string) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_SELF_SERVICE_CONFIGURATION_START,
        })

        return axios
            .get<ApiListResponse<SelfServiceConfiguration[]>>(
                `/api/self_service_configurations/${integrationId}`
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type:
                            constants.FETCH_SELF_SERVICE_CONFIGURATION_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    dispatch({
                        type: constants.FETCH_SELF_SERVICE_CONFIGURATION_ERROR,
                        error,
                        reason: 'Failed to fetch Self-service configuration',
                    })
                }
            )
    }
}

export function fetchSelfServiceConfigurations() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_SELF_SERVICE_CONFIGURATIONS_START,
        })

        return axios
            .get<ApiListResponse<SelfServiceConfiguration[]>>(
                '/api/self_service_configurations/'
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type:
                            constants.FETCH_SELF_SERVICE_CONFIGURATIONS_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.FETCH_SELF_SERVICE_CONFIGURATIONS_ERROR,
                        error,
                        reason: 'Failed to fetch Self-service configurations',
                    })
                }
            )
    }
}

export function updateSelfServiceConfigurations(
    configuration: SelfServiceConfiguration
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.UPDATE_SELF_SERVICE_CONFIGURATION_START,
        })

        return axios
            .put<ApiListResponse<SelfServiceConfiguration>>(
                `/api/self_service_configurations/${configuration.id}`,
                configuration
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Self-service configuration updated',
                        })
                    )

                    return dispatch({
                        type:
                            constants.UPDATE_SELF_SERVICE_CONFIGURATION_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.UPDATE_SELF_SERVICE_CONFIGURATION_ERROR,
                        error,
                        reason:
                            'Failed to update the Self-service configuration',
                    })
                }
            )
    }
}
