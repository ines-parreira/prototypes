// @flow
import {fromJS, type Map} from 'immutable'
import moment from 'moment'

import {FACEBOOK_INTEGRATION_TYPE, OUTLOOK_INTEGRATION_TYPE} from '../../constants/integration'

import type {actionType} from '../types'

import * as constants from './constants.js'


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
    },

    extra: {
        [FACEBOOK_INTEGRATION_TYPE]: {
            onboardingIntegrations: {
                data: [],
                meta: {}
            }
        },
        [OUTLOOK_INTEGRATION_TYPE]: {
            onboardingIntegrations: {
                data: [],
                meta: {}
            }
        }
    }
})

/**
 * The list of integrations will be refetched on/before rendering.
 * So we don't need to update the state when an integration is added/updated/deleted.
 * If we see 'flickering' in the frontend we should update the state here instead of waiting for the integrations
 * to be fetched.
 */
export default function reducer(state: Map<*,*> = initialState, action: defaultActionType): Map<*,*> {
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
                .sortBy((integration) => integration.get('name'))
                .sortBy((integration) => moment(integration.get('deactivated_datetime')))
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
        case constants.UPDATE_INTEGRATION_SUCCESS: {
            const newIntegration = fromJS(action.resp)

            const integrationIndex = state
                .get('integrations')
                .findIndex((integration) => newIntegration.get('id') === integration.get('id'))

            let newState = state
                .setIn(['state', 'loading', 'updateIntegration'], false)
                .set('integration', newIntegration)

            let integrations = newState.get('integrations')

            integrations = ~integrationIndex
                ? integrations.set(integrationIndex, newIntegration)
                : integrations.push(newIntegration)

            integrations = integrations
                .sortBy((integration) => integration.get('name'))
                .sortBy((integration) => moment(integration.get('deactivated_datetime')))

            return newState.set('integrations', integrations)
        }

        case constants.DELETE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'delete'], action.id)

        case constants.DELETE_INTEGRATION_SUCCESS:
            return state.update('integrations', (integrations) => (
                integrations.valueSeq().filter((integration) => integration.get('id') !== action.id).toList()
            )).setIn(['state', 'loading', 'delete'], false)

        case constants.DELETE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'delete'], false)

        case constants.TEST_HTTP_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'testing'], true)

        case constants.EMAIL_INTEGRATION_IMPORT_START:
            return state.setIn(['state', 'loading', 'import'], action.id)

        case constants.EMAIL_INTEGRATION_IMPORT_ERROR:
        case constants.EMAIL_INTEGRATION_IMPORT_SUCCESS:
            return state.setIn(['state', 'loading', 'import'], false)
                .set('integration', fromJS(action.resp))

        case constants.TEST_HTTP_INTEGRATION_SUCCESS:
            return state.setIn(['integration', 'testing'], fromJS(action.response))
                .setIn(['state', 'loading', 'testing'], false)

        case constants.EMAIL_INTEGRATION_VERIFIED: {
            const integrations = state.get('integrations')

            return state
                .setIn(['integration', 'meta', 'verified'], true)
                .set('integrations', integrations.update(
                    integrations.findIndex((integration) => integration.get('id') === action.integrationId),
                    (integration) => integration.setIn(['meta', 'verified'], true))
                )
        }

        case constants.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS: {
            const currentPage = state.getIn(['extra', action.integrationType, 'onboardingIntegrations', 'meta', 'page'])

            if (!currentPage || action.forceOverride || action.resp.meta.page === currentPage) {
                return state.setIn(['extra', action.integrationType, 'onboardingIntegrations'], fromJS(action.resp))
            }

            return state.setIn(['extra', action.integrationType, 'onboardingIntegrations', 'meta'], fromJS(action.resp.meta))
        }

        default:
            return state
    }
}
