import {Map, fromJS} from 'immutable'
import * as types from '../constants/integration.js'
import {INTEGRATION_TYPE_DESCRIPTIONS} from '../constants'

const integrationSettingsInitial = fromJS({
    integrations: [],
    integration: {},
    state: {
        loading: {
            facebookLogin: false,
            integration: false,
            integrations: false,
            updateIntegration: false
        }
    }
})

/**
 * The list of integrations will be refetched on/before rendering.
 * So we don't need to update the state when an integration is added/updated/deleted.
 * If we see 'flickering' in the frontend we should update the state here instead of waiting for the integrations
 * to be fetched.
 */
export function integrationSettings(state = integrationSettingsInitial, action) {
    const integrations = state.get('integrations')
    let newState = state

    switch (action.type) {
        case types.SELECT_FACEBOOK_PAGE:
            return state.set('integration', Map({}).merge(integrations.find((v) => v.getIn(['facebook', 'page_id']) === action.pageId)))

        case types.FETCH_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'integration'], true)

        case types.FETCH_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'integration'], false)

        case types.FETCH_INTEGRATION_SUCCESS:
            // The integration to edit.
            return (state.set('integration', fromJS(action.resp))
                .setIn(['state', 'loading', 'integration'], false))

        case types.FETCH_INTEGRATIONS_START:
            return state.setIn(['state', 'loading', 'integrations'], true)

        case types.FETCH_INTEGRATIONS_ERROR:
            return state.setIn(['state', 'loading', 'integrations'], false)

        case types.FETCH_INTEGRATIONS_SUCCESS:
            return (state.set('integrations', fromJS(action.resp.data))
                .setIn(['state', 'loading', 'integrations'], false))

        case types.TOGGLE_PRIVATE_MESSAGES_ENABLED:
            return state.setIn(['integration', 'facebook', 'settings', 'private_messages_enabled'],
                !state.getIn(['integration', 'facebook', 'settings', 'private_messages_enabled']))

        case types.TOGGLE_POSTS_ENABLED:
            return state.setIn(['integration', 'facebook', 'settings', 'posts_enabled'],
                !state.getIn(['integration', 'facebook', 'settings', 'posts_enabled']))

        case types.TOGGLE_IMPORT_HISTORY_ENABLED:
            return state.setIn(['integration', 'facebook', 'settings', 'import_history_enabled'],
                !state.getIn(['integration', 'facebook', 'settings', 'import_history_enabled']))

        case types.FACEBOOK_LOGIN:
            return state.setIn(['state', 'loading', 'facebookLogin'], true)
        case types.FACEBOOK_LOGIN_ERROR:
            return state.setIn(['state', 'loading', 'facebookLogin'], false)

        case types.FACEBOOK_LOGIN_SUCCESS:
            // We can't just concatenate since we might get duplicates if we call it several times. So we merge on page id.
            for (const pageIntegration of action.resp.data) {
                const existingIndex = newState.get('integrations').findIndex((int) => int.getIn(['facebook', 'page_id']) === pageIntegration.facebook.page_id)
                if (~existingIndex) {
                    newState = newState.setIn(['integrations', existingIndex], fromJS(pageIntegration))
                } else {
                    newState = newState.set('integrations', newState.get('integrations').push(fromJS(pageIntegration)))
                }
            }

            return newState.setIn(['state', 'loading', 'facebookLogin'], false)

        case types.UPDATE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'updateIntegration'], true)
        case types.UPDATE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)
        case types.UPDATE_INTEGRATION_SUCCESS:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)
        default:
            return state
    }
}


/**
 * Compute the number of active integrations for each type
 */
function getIntegrationsCountPerType(integrations) {
    return integrations
        .filter((int) => !int.get('deactivated_datetime'))
        .reduce((accumulator, item) => {
            const newAccumulator = accumulator
            if (item.get('type') in accumulator) {
                newAccumulator[item.get('type')] += 1
            } else {
                newAccumulator[item.get('type')] = 1
            }
            return newAccumulator
        }, {})
}


/**
 * We take a global variable with a list of types and their descriptions as objects and we add the number of
 * integrations for each type to these objects.
 * @param integrations
 * @returns {*}
 */
export function getIntegrationsSummary(integrations) {
    const counts = getIntegrationsCountPerType(integrations)
    return fromJS(INTEGRATION_TYPE_DESCRIPTIONS.map((typeDescription) => (
        {
            ...typeDescription,
            count: counts[typeDescription.type] || 0
        })
    ))
}
