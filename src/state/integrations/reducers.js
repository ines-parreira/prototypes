import {fromJS} from 'immutable'
import moment from 'moment'
import * as types from './constants.js'

const initialState = fromJS({
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
export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'integration'], true)

        case types.FETCH_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'integration'], false)

        case types.FETCH_INTEGRATION_SUCCESS:
            // The integration to edit.
            return state.set('integration', fromJS(action.integration))
                .setIn(['state', 'loading', 'integration'], false)

        case types.FETCH_INTEGRATIONS_START:
            return state.setIn(['state', 'loading', 'integrations'], true)

        case types.FETCH_INTEGRATIONS_ERROR:
            return state.setIn(['state', 'loading', 'integrations'], false)

        case types.FETCH_INTEGRATIONS_SUCCESS: {
            const integrations = fromJS(action.resp.data)
                .sortBy(inte => inte.get('name'))
                .sortBy(inte => moment(inte.get('deactivated_datetime')))
            return state.set('integrations', integrations)
                .setIn(['state', 'loading', 'integrations'], false)
        }

        case types.CREATE_INTEGRATION_START:
        case types.UPDATE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'updateIntegration'], action.integration.get('id', true))

        case types.CREATE_INTEGRATION_ERROR:
        case types.UPDATE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)

        case types.CREATE_INTEGRATION_SUCCESS:
        case types.UPDATE_INTEGRATION_SUCCESS:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)
                .set('integration', fromJS(action.resp))

        case types.DELETE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'delete'], action.id)

        case types.DELETE_INTEGRATION_SUCCESS:
            return state.update('integrations', integrations => (
                integrations.valueSeq().filter(int => int.get('id') !== action.id)
            )).setIn(['state', 'loading', 'delete'], false)

        case types.DELETE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'delete'], false)

        case types.TEST_HTTP_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'testing'], true)

        case types.GMAIL_INTEGRATION_IMPORT_START:
            return state.setIn(['state', 'loading', 'import'], action.id)

        case types.GMAIL_INTEGRATION_IMPORT_ERROR:
        case types.GMAIL_INTEGRATION_IMPORT_SUCCESS:
            return state.setIn(['state', 'loading', 'import'], false)
                .set('integration', fromJS(action.resp))

        case types.TEST_HTTP_INTEGRATION_SUCCESS:
            return state.setIn(['integration', 'testing'], fromJS(action.response))
                .setIn(['state', 'loading', 'testing'], false)

        default:
            return state
    }
}
