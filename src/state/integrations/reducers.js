import {Map, fromJS} from 'immutable'
import moment from 'moment'
import * as types from './constants.js'

const initialState = fromJS({
    integrations: [],
    integration: {},
    state: {
        loading: {
            facebookLogin: false,
            integration: false,
            integrations: false,
            updateIntegration: false,
            testing: false,
            delete: false
        }
    },
    _internal: {
        facebookLoginStatus: 'unknown'
    }
})

/**
 * The list of integrations will be refetched on/before rendering.
 * So we don't need to update the state when an integration is added/updated/deleted.
 * If we see 'flickering' in the frontend we should update the state here instead of waiting for the integrations
 * to be fetched.
 */
export default (state = initialState, action) => {
    const integrations = state.get('integrations')

    switch (action.type) {
        case types.SELECT_FACEBOOK_PAGE:
            return state.set(
                'integration',
                Map({}).merge(integrations.find((v) => v.getIn(['facebook', 'page_id']) === action.pageId))
            )

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
            const data = fromJS(action.resp.data).sortBy(i => moment(i.get('deactivated_datetime'))).reverse()
            return state.set('integrations', data)
                .setIn(['state', 'loading', 'integrations'], false)
        }

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

        case types.FACEBOOK_LOGIN_SUCCESS: {
            let newState = state
            // We can't just concatenate since we might get duplicates if we call it several times.
            // So we merge on page id.
            if (action.resp) {
                for (const pageIntegration of action.resp.data) {
                    const existingIndex = newState.get('integrations')
                        .findIndex((int) => int.getIn(['facebook', 'page_id']) === pageIntegration.facebook.page_id)
                    if (~existingIndex) {
                        newState = newState.setIn(['integrations', existingIndex], fromJS(pageIntegration))
                    } else {
                        newState = newState.set(
                            'integrations',
                            newState.get('integrations').push(fromJS(pageIntegration))
                        )
                    }
                }
            }
            return newState.setIn(['state', 'loading', 'facebookLogin'], false)
        }

        case types.FACEBOOK_LOGIN_STATUS:
            return state.setIn(['_internal', 'facebookLoginStatus'], action.status)

        case types.UPDATE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'updateIntegration'], action.integration.get('id', true))

        case types.UPDATE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)

        case types.UPDATE_INTEGRATION_SUCCESS:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)
                .set('integration', fromJS(action.resp))

        case types.DELETE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'delete'], action.id)

        case types.DELETE_INTEGRATION_SUCCESS:
            return state.set('integrations',
                state.get('integrations')
                    .valueSeq()
                    .filter(int => int.get('id') !== action.id)
            )

        case types.TEST_HTTP_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'testing'], true)

        case types.TEST_HTTP_INTEGRATION_SUCCESS:
            return state.setIn(['integration', 'testing'], fromJS(action.response))
                .setIn(['state', 'loading', 'testing'], false)

        default:
            return state
    }
}
