import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import moment from 'moment'

import type {
    EmailMigrationInboundVerification,
    Integration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasAction } from 'state/types'

import * as constants from './constants'
import type { IntegrationsImmutableState } from './types'

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
            chatStatus: {},
        },
        error: {
            chatStatus: {},
        },
    },
    migrations: {
        email: [],
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
        [IntegrationType.GorgiasChat]: {
            shopifyCheckoutChatBannerVisible: true,
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
    action: GorgiasAction,
): IntegrationsImmutableState {
    switch (action.type) {
        case constants.FETCH_INTEGRATION_START:
            return state.setIn(['state', 'loading', 'integration'], true)

        case constants.FETCH_INTEGRATION_ERROR:
            return state.setIn(['state', 'loading', 'integration'], false)

        case constants.FETCH_INTEGRATION_SUCCESS: {
            const newIntegration = fromJS(action.integration) as Map<any, any>
            const integrations = state.get('integrations') as List<any>
            const integrationIndex = integrations.findIndex(
                (integration: Map<any, any>) =>
                    newIntegration.get('id') === integration.get('id'),
            )

            return state
                .set('integration', newIntegration)
                .setIn(['state', 'loading', 'integration'], false)
                .update('integrations', (list: List<any>) =>
                    ~integrationIndex
                        ? list.set(integrationIndex, newIntegration)
                        : list,
                )
        }

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
                        integration.get('name') as string,
                )
                .sortBy((integration: Map<any, any>) =>
                    moment(integration.get('deactivated_datetime')),
                ) as List<any>

            const currentIntegration = state.get('integration') as
                | Map<any, any>
                | undefined
            const currentIntegrationId = currentIntegration?.get('id')
            let mergedIntegrations = integrations
            if (currentIntegrationId) {
                const idx = integrations.findIndex(
                    (integration: Map<any, any>) =>
                        integration.get('id') === currentIntegrationId,
                )
                if (~idx) {
                    mergedIntegrations = integrations.set(
                        idx,
                        currentIntegration,
                    )
                }
            }

            return state
                .set('integrations', mergedIntegrations)
                .setIn(['state', 'loading', 'integrations'], false)
        }

        case constants.CREATE_INTEGRATION_START:
        case constants.UPDATE_INTEGRATION_START:
            return state.setIn(
                ['state', 'loading', 'updateIntegration'],
                (action.integration as Map<any, any>).get('id', true),
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
                    newIntegration.get('id') === integration.get('id'),
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
                        integration.get('name') as string,
                )
                .sortBy((integration: Map<any, any>) =>
                    moment(integration.get('deactivated_datetime')),
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
                                integration.get('id') !== action.id,
                        )
                        .toList(),
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
                    true,
                )
                .set(
                    'integrations',
                    integrations.update(
                        integrations.findIndex(
                            (integration: Map<any, any>) =>
                                integration.get('id') === action.integrationId,
                        ),
                        (integration: Map<any, any>) =>
                            integration.setIn(
                                ['meta', 'email_forwarding_activated'],
                                true,
                            ),
                    ),
                )
        }

        case constants.EMAIL_INTEGRATION_VERIFIED: {
            const integrations = state.get('integrations') as List<any>

            return state.setIn(['integration', 'meta', 'verified'], true).set(
                'integrations',
                integrations.update(
                    integrations.findIndex(
                        (integration: Map<any, any>) =>
                            integration.get('id') === action.integrationId,
                    ),
                    (integration: Map<any, any>) =>
                        integration.setIn(['meta', 'verified'], true),
                ),
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
                (action.resp as { meta: { page: number } }).meta.page ===
                    currentPage
            ) {
                return state.setIn(
                    ['extra', action.integrationType, 'onboardingIntegrations'],
                    fromJS(action.resp),
                )
            }

            return state.setIn(
                [
                    'extra',
                    action.integrationType,
                    'onboardingIntegrations',
                    'meta',
                ],
                fromJS((action.resp as { meta: Record<string, any> }).meta),
            )
        }

        case constants.FETCH_CHAT_STATUS_START:
            return state
                .setIn(['state', 'loading', 'chatStatus', action.id], true)
                .setIn(['state', 'error', 'chatStatus', action.id], false)

        case constants.FETCH_CHAT_STATUS_SUCCESS: {
            const integrations = state.get('integrations') as List<any>

            return state
                .setIn(['state', 'loading', 'chatStatus', action.id], false)
                .set(
                    'integrations',
                    integrations.update(
                        integrations.findIndex(
                            (integration: Map<any, any>) =>
                                integration.get('id') === action.id,
                        ),
                        (integration: Map<any, any>) =>
                            integration.setIn(
                                ['meta', 'status'],
                                action.chatStatus,
                            ),
                    ),
                )
        }

        case constants.FETCH_CHAT_STATUS_ERROR:
            return state
                .setIn(['state', 'loading', 'chatStatus', action.id], false)
                .setIn(['state', 'error', 'chatStatus', action.id], true)

        case constants.SET_EMAIL_PROVIDER_MIGRATION_BANNER_STATUS:
            return state.set(
                'emailMigrationBannerStatus',
                fromJS(action.emailMigrationBannerStatus),
            )
        case constants.SET_EMAIL_PROVIDER_MIGRATIONS:
            return state.setIn(
                ['migrations', 'email'],
                fromJS(action.emailMigrations),
            )

        case constants.UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS: {
            const migrations = (
                state.getIn(['migrations', 'email']) as Map<any, any>
            ).toJS() as EmailMigrationInboundVerification[]

            const newMigrations = migrations.map((migration) =>
                migration.integration.id === action.integrationId
                    ? {
                          ...migration,
                          status: action.emailMigrationVerificationStatus,
                      }
                    : migration,
            )

            return state.setIn(['migrations', 'email'], fromJS(newMigrations))
        }
        case constants.UPDATE_FORWARDING_EMAIL_ADDRESS:
            return state.setIn(
                ['authentication', 'email', 'forwarding_email_address'],
                action.emailForwardingAddress,
            )
        case constants.HIDE_SHOPIFY_CHECKOUT_CHAT_BANNER:
            return state.setIn(
                [
                    'extra',
                    IntegrationType.GorgiasChat,
                    'shopifyCheckoutChatBannerVisible',
                ],
                false,
            )
        default:
            return state
    }
}
