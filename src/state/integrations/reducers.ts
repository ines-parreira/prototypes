import {fromJS, Map, List} from 'immutable'
import moment from 'moment'

import {Integration, IntegrationType} from 'models/integration/types'
import {GorgiasAction} from 'state/types'

import * as constants from './constants'
import {IntegrationsImmutableState} from './types'

export const initialState: IntegrationsImmutableState = fromJS({
    integrations: [],
    integration: {},
    emailDomain: {},
    authentication: {}, // store data necessary for authenticating from the front-end, for each integration type
    state: {
        loading: {
            integration: false,
            integrations: false,
            emailDomain: false,
            updateIntegration: false,
            testing: false,
            delete: false,
        },
    },

    extra: {
        [IntegrationType.Facebook]: {
            onboardingIntegrations: {
                data: [],
                meta: {},
            },
        },
        [IntegrationType.Outlook]: {
            onboardingIntegrations: {
                data: [],
                meta: {},
            },
        },
    },
})

/**
 * The list of integrations will be refetched on/before rendering.
 * So we don't need to update the state when an integration is added/updated/deleted.
 * If we see 'flickering' in the frontend we should update the state here instead of waiting for the integrations
 * to be fetched.
 */
export default function reducer(
    state: IntegrationsImmutableState = initialState,
    action: GorgiasAction
): IntegrationsImmutableState {
    switch (action.type) {
        case constants.FETCH_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'integration'], true)

        case constants.FETCH_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'integration'], false)

        case constants.FETCH_INTEGRATION_SUCCESS:
            // The integration to edit.
            return state
                .set('integration', fromJS(action.integration))
                .setIn(['state', 'loading', 'integration'], false)

        case constants.FETCH_EMAIL_DOMAIN_START:
        case constants.CREATE_EMAIL_DOMAIN_START:
        case constants.DELETE_EMAIL_DOMAIN_START:
            return state.setIn(['state', 'loading', 'emailDomain'], true)

        case constants.FETCH_EMAIL_DOMAIN_ERROR:
        case constants.CREATE_EMAIL_DOMAIN_ERROR:
        case constants.DELETE_EMAIL_DOMAIN_ERROR:
            return state.setIn(['state', 'loading', 'emailDomain'], false)

        case constants.FETCH_EMAIL_DOMAIN_SUCCESS:
        case constants.CREATE_EMAIL_DOMAIN_SUCCESS:
            return state
                .set('emailDomain', fromJS(action.emailDomain))
                .setIn(['state', 'loading', 'emailDomain'], false)

        case constants.DELETE_EMAIL_DOMAIN_SUCCESS:
            return state
                .set('emailDomain', null)
                .setIn(['state', 'loading', 'emailDomain'], false)

        case constants.FETCH_INTEGRATIONS_START:
            return state.setIn(['state', 'loading', 'integrations'], true)

        case constants.FETCH_INTEGRATIONS_ERROR:
            return state.setIn(['state', 'loading', 'integrations'], false)

        case constants.FETCH_INTEGRATIONS_SUCCESS: {
            const integrations = (
                fromJS(action.resp as Integration[]) as List<any>
            )
                .sortBy(
                    (integration: Map<any, any>) =>
                        integration.get('name') as string
                )
                .sortBy((integration: Map<any, any>) =>
                    moment(integration.get('deactivated_datetime'))
                ) as List<any>
            return state
                .set('integrations', integrations)
                .setIn(['state', 'loading', 'integrations'], false)
        }

        case constants.CREATE_INTEGRATION_START:
        case constants.UPDATE_INTEGRATION_START:
            return state.setIn(
                ['state', 'loading', 'updateIntegration'],
                (action.integration as Map<any, any>).get('id', true)
            )

        case constants.CREATE_INTEGRATION_ERROR:
        case constants.UPDATE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'updateIntegration'], false)

        case constants.CREATE_INTEGRATION_SUCCESS:
        case constants.UPDATE_INTEGRATION_SUCCESS: {
            const newIntegration = fromJS(action.resp) as Map<any, any>

            const integrationIndex = (
                state.get('integrations') as List<any>
            ).findIndex(
                (integration: Map<any, any>) =>
                    newIntegration.get('id') === integration.get('id')
            )

            const newState = state
                .setIn(['state', 'loading', 'updateIntegration'], false)
                .set('integration', newIntegration)

            let integrations = newState.get('integrations') as List<any>

            integrations = ~integrationIndex
                ? integrations.set(integrationIndex, newIntegration)
                : integrations.push(newIntegration)

            integrations = integrations
                .sortBy(
                    (integration: Map<any, any>) =>
                        integration.get('name') as string
                )
                .sortBy((integration: Map<any, any>) =>
                    moment(integration.get('deactivated_datetime'))
                ) as List<any>

            return newState.set('integrations', integrations)
        }

        case constants.DELETE_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'delete'], action.id)

        case constants.DELETE_INTEGRATION_SUCCESS:
            return state
                .update('integrations', (integrations: List<any>) =>
                    integrations
                        .valueSeq()
                        .filter(
                            (integration: Map<any, any>) =>
                                integration.get('id') !== action.id
                        )
                        .toList()
                )
                .setIn(['state', 'loading', 'delete'], false)

        case constants.DELETE_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'delete'], false)

        case constants.TEST_HTTP_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'testing'], true)

        case constants.EMAIL_INTEGRATION_IMPORT_START:
            return state.setIn(['state', 'loading', 'import'], action.id)

        case constants.EMAIL_INTEGRATION_IMPORT_ERROR:
        case constants.EMAIL_INTEGRATION_IMPORT_SUCCESS:
            return state
                .setIn(['state', 'loading', 'import'], false)
                .set('integration', fromJS(action.resp))

        case constants.TEST_HTTP_INTEGRATION_SUCCESS:
            return state
                .setIn(['integration', 'testing'], fromJS(action.response))
                .setIn(['state', 'loading', 'testing'], false)

        case constants.EMAIL_FORWARDING_ACTIVATED: {
            const integrations = state.get('integrations') as List<any>
            return state
                .setIn(
                    ['integration', 'meta', 'email_forwarding_activated'],
                    true
                )
                .set(
                    'integrations',
                    integrations.update(
                        integrations.findIndex(
                            (integration: Map<any, any>) =>
                                integration.get('id') === action.integrationId
                        ),
                        (integration: Map<any, any>) =>
                            integration.setIn(
                                ['meta', 'email_forwarding_activated'],
                                true
                            )
                    )
                )
        }

        case constants.EMAIL_INTEGRATION_VERIFIED: {
            const integrations = state.get('integrations') as List<any>

            return state.setIn(['integration', 'meta', 'verified'], true).set(
                'integrations',
                integrations.update(
                    integrations.findIndex(
                        (integration: Map<any, any>) =>
                            integration.get('id') === action.integrationId
                    ),
                    (integration: Map<any, any>) =>
                        integration.setIn(['meta', 'verified'], true)
                )
            )
        }

        case constants.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS: {
            const currentPage = state.getIn([
                'extra',
                action.integrationType,
                'onboardingIntegrations',
                'meta',
                'page',
            ])

            if (
                !currentPage ||
                action.forceOverride ||
                (action.resp as {meta: {page: number}}).meta.page ===
                    currentPage
            ) {
                return state.setIn(
                    ['extra', action.integrationType, 'onboardingIntegrations'],
                    fromJS(action.resp)
                )
            }

            return state.setIn(
                [
                    'extra',
                    action.integrationType,
                    'onboardingIntegrations',
                    'meta',
                ],
                fromJS((action.resp as {meta: Record<string, any>}).meta)
            )
        }

        default:
            return state
    }
}
