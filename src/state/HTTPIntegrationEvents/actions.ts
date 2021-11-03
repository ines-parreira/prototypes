import axios, {AxiosError} from 'axios'

import {ApiListResponsePagination} from '../../models/api/types'
import {StoreDispatch} from '../types'

import * as constants from './constants.js'
import {HTTPIntegrationEvent} from './types'

/**
 * Fetch events of a HTTP integration
 */
export function fetchHTTPIntegrationEvents(integrationId: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return axios
            .get<ApiListResponsePagination<HTTPIntegrationEvent[]>>(
                `/api/integrations/${integrationId}/events/`
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_HTTP_INTEGRATION_EVENTS_SUCCESS,
                        events: resp.data,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: 'ERROR',
                        error,
                        reason: 'Failed to fetch events.',
                    })
                }
            )
    }
}

/**
 * Fetch an event of a HTTP integration
 */
export function fetchHTTPIntegrationEvent(
    integrationId: number,
    eventId: number
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return axios
            .get<HTTPIntegrationEvent>(
                `/api/integrations/${integrationId}/events/${eventId}`
            )
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_HTTP_INTEGRATION_EVENT_SUCCESS,
                        event: resp.data,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: 'ERROR',
                        error,
                        reason: 'Failed to fetch event',
                    })
                }
            )
    }
}
