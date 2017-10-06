// @flow
import {fromJS} from 'immutable'
import moment from 'moment'
import * as constants from './constants.js'

import type {Map} from 'immutable'
import type {actionType} from '../types'

type defaultActionType = actionType & {
    id: string,
    integration: {},
    response: {},
    resp: {
        data: {}
    }
}

export const initialState = fromJS({
    integrations: [],
    integration: {},
    authentication: {},  // store data necessary for authenticating from the front-end, for each integration type
    state: {
        loading: {
            integration: false,
            integrations: false,
            updateIntegration: false,
            testing: false,
            delete: false
        }
    }
})

/**
 * The list of integrations will be refetched on/before rendering.
 * So we don't need to update the state when an integration is added/updated/deleted.
 * If we see 'flickering' in the frontend we should update the state here instead of waiting for the integrations
 * to be fetched.
 */
export default (state: Map<*,*> = initialState, action: defaultActionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'integration'], true)

        case constants.FETCH_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'integration'], false)

        case constants.FETCH_INTEGRATION_SUCCESS:
            // The integration to edit.
            return state.set('integration', fromJS(action.integration))
                .setIn(['state', 'loading', 'integration'], false)

        case constants.FETCH_INTEGRATIONS_START:
            return state.setIn(['state', 'loading', 'integrations'], true)

        case constants.FETCH_INTEGRATIONS_ERROR:
            return state.setIn(['state', 'loading', 'integrations'], false)

        case constants.FETCH_INTEGRATIONS_SUCCESS: {
            const integrations = fromJS(action.resp.data)
                .sortBy(inte => inte.get('name'))
                .sortBy(inte => moment(inte.get('deactivated_datetime')))
            return state.set('integrations', integrations)
                .setIn(['state', 'loading', 'integrations'], false)
        }

        case constants.CREATE_INTEGRATION_START:
        case constants.UPDATE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'updateIntegration'], action.integration.get('id', true))

        case constants.CREATE_INTEGRATION_ERROR:
        case constants.UPDATE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)

        case constants.CREATE_INTEGRATION_SUCCESS:
        case constants.UPDATE_INTEGRATION_SUCCESS:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)
                .set('integration', fromJS(action.resp))

        case constants.DELETE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'delete'], action.id)

        case constants.DELETE_INTEGRATION_SUCCESS:
            return state.update('integrations', integrations => (
                integrations.valueSeq().filter(int => int.get('id') !== action.id).toList()
            )).setIn(['state', 'loading', 'delete'], false)

        case constants.DELETE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'delete'], false)

        case constants.TEST_HTTP_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'testing'], true)

        case constants.GMAIL_INTEGRATION_IMPORT_START:
            return state.setIn(['state', 'loading', 'import'], action.id)

        case constants.GMAIL_INTEGRATION_IMPORT_ERROR:
        case constants.GMAIL_INTEGRATION_IMPORT_SUCCESS:
            return state.setIn(['state', 'loading', 'import'], false)
                .set('integration', fromJS(action.resp))

        case constants.TEST_HTTP_INTEGRATION_SUCCESS:
            return state.setIn(['integration', 'testing'], fromJS(action.response))
                .setIn(['state', 'loading', 'testing'], false)

        default:
            return state
    }
}
