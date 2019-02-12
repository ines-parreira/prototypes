// @flow
import axios from 'axios'

import type {dispatchType} from '../types'

import * as constants from './constants'

/**
 * Fetch events of a HTTP integration
 *
 * @param {number} integrationId - the id of the integration for which we want to fetch its events
 * @returns {Promise}
 */
export function fetchHTTPIntegrationEvents(integrationId: number): Function {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get(`/api/integrations/${integrationId}/events/`,)
            .then((json = {}) => json.data)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_HTTP_INTEGRATION_EVENTS_SUCCESS,
                    events: resp.data
                })
            }, (error) => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to fetch events.'
                })
            })
    }
}

/**
 * Fetch an event of a HTTP integration
 *
 * @param {number} integrationId - the id of the integration for which we want to fetch its events
 * @param {number} eventId - the id of the event
 * @returns {Promise}
 */
export function fetchHTTPIntegrationEvent(integrationId: number, eventId: number): Function {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.get(`/api/integrations/${integrationId}/events/${eventId}`,)
            .then((resp) => {
                return dispatch({
                    type: constants.FETCH_HTTP_INTEGRATION_EVENT_SUCCESS,
                    event: resp.data
                })
            }, (error) => {
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to fetch event'
                })
            })
    }
}
