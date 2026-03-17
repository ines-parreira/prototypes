import type { Map, Seq } from 'immutable'
import { fromJS } from 'immutable'

import {
    baseHttp,
    httpIntegration,
    integrationsState,
} from '../../../fixtures/integrations'
import type { EmailMigrationInboundVerification } from '../../../models/integration/types'
import {
    EmailMigrationInboundVerificationStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
    OAuth2TokenLocation,
} from '../../../models/integration/types'
import type { RootState } from '../../types'
import * as types from '../constants'
import reducer, { initialState } from '../reducers'
import {
    DEPRECATED_getIntegrationsState,
    getEmailIntegrations,
} from '../selectors'

const state = {
    integrations: fromJS(integrationsState),
} as RootState

describe('integrations reducers', () => {
    it('should handle DELETE_INTEGRATION_SUCCESS', () => {
        const action = {
            type: types.DELETE_INTEGRATION_SUCCESS,
            id: getEmailIntegrations(state).getIn([0, 'id']),
        }
        const newState = reducer(state.integrations, action)
        const expected = DEPRECATED_getIntegrationsState(state)
            .update('integrations', (integrations) =>
                (
                    (integrations as Map<any, any>)
                        .valueSeq()
                        .filter(
                            (int: Map<any, any>) => int.get('id') !== action.id,
                        ) as Seq.Indexed<Map<any, any>>
                ).toList(),
            )
            .setIn(['state', 'loading', 'delete'], false)

        expect(newState).toEqual(expected)
    })

    it('should handle DELETE_INTEGRATION_ERROR', () => {
        const newState = reducer(state.integrations, {
            type: types.DELETE_INTEGRATION_ERROR,
        })
        const expected = DEPRECATED_getIntegrationsState(state).setIn(
            ['state', 'loading', 'delete'],
            false,
        )
        expect(newState).toEqual(expected)
    })

    it('should set integration.meta.verified to true on EMAIL_INTEGRATION_VERIFIED', () => {
        const newState = reducer(state.integrations, {
            type: types.EMAIL_INTEGRATION_VERIFIED,
            integrationId: DEPRECATED_getIntegrationsState(state).getIn([
                'integrations',
                0,
                'id',
            ]),
        })
        const expected = DEPRECATED_getIntegrationsState(state)
            .setIn(['integration', 'meta', 'verified'], true)
            .setIn(['integrations', 0, 'meta', 'verified'], true)
        expect(newState).toEqual(expected)
    })

    it('should handle HIDE_SHOPIFY_CHECKOUT_CHAT_BANNER', () => {
        // Given
        const action = {
            type: types.HIDE_SHOPIFY_CHECKOUT_CHAT_BANNER,
        }
        const initialFlagValue = state.integrations.getIn([
            'extra',
            IntegrationType.GorgiasChat,
            'shopifyCheckoutChatBannerVisible',
        ])

        // When
        const newState = reducer(state.integrations, action)
        const expected = state.integrations.setIn(
            [
                'extra',
                IntegrationType.GorgiasChat,
                'shopifyCheckoutChatBannerVisible',
            ],
            false,
        )

        expect(initialFlagValue).toEqual(true)
        expect(newState).toEqual(expected)
    })

    describe('FETCH_ONBOARDING_INTEGRATIONS_SUCCESS', () => {
        const integrationTypes = [IntegrationType.Facebook]

        integrationTypes.forEach((integrationType) => {
            it(`should set the data because there is no current page (${integrationType})`, () => {
                const onboardingIntegrations = {
                    data: [{ id: 1 }],
                    meta: {
                        page: 1,
                        nb_pages: 1,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(state.integrations, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        integrationType,
                    }),
                ).toEqual(
                    DEPRECATED_getIntegrationsState(state).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations),
                    ),
                )
            })

            it(`should set the data because the forceOverride flag is set (${integrationType})`, () => {
                const integrationsState = state.integrations.setIn(
                    [
                        'extra',
                        integrationType,
                        'onboardingIntegrations',
                        'meta',
                        'page',
                    ],
                    1,
                )
                const onboardingIntegrations = {
                    data: [{ id: 1 }],
                    meta: {
                        page: 2,
                        nb_pages: 2,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(integrationsState, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        forceOverride: true,
                        integrationType,
                    }),
                ).toEqual(
                    DEPRECATED_getIntegrationsState({
                        integrations: integrationsState,
                    } as RootState).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations),
                    ),
                )
            })

            it(`should set the data because the page of the response matches the current page (${integrationType})`, () => {
                const integrationsState = state.integrations.setIn(
                    [
                        'extra',
                        integrationType,
                        'onboardingIntegrations',
                        'meta',
                        'page',
                    ],
                    1,
                )
                const onboardingIntegrations = {
                    data: [{ id: 1 }],
                    meta: {
                        page: 1,
                        nb_pages: 2,
                        item_count: 1,
                    },
                }

                expect(
                    reducer(integrationsState, {
                        type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp: onboardingIntegrations,
                        integrationType,
                    }),
                ).toEqual(
                    DEPRECATED_getIntegrationsState({
                        integrations: integrationsState,
                    } as RootState).setIn(
                        ['extra', integrationType, 'onboardingIntegrations'],
                        fromJS(onboardingIntegrations),
                    ),
                )
            })

            it(
                'should not set the data but still set the meta because there is a current page different from the page ' +
                    `associated with the response, and the forceOverride flag is not set  (${integrationType})`,
                () => {
                    const integrationsState = state.integrations.setIn(
                        [
                            'extra',
                            integrationType,
                            'onboardingIntegrations',
                            'meta',
                            'page',
                        ],
                        1,
                    )
                    const onboardingIntegrations = {
                        data: [{ id: 1 }],
                        meta: {
                            page: 2,
                            nb_pages: 2,
                            item_count: 1,
                        },
                    }

                    expect(
                        reducer(integrationsState, {
                            type: types.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                            resp: onboardingIntegrations,
                            integrationType,
                        }),
                    ).toEqual(
                        DEPRECATED_getIntegrationsState({
                            integrations: integrationsState,
                        } as RootState).setIn(
                            [
                                'extra',
                                integrationType,
                                'onboardingIntegrations',
                                'meta',
                            ],
                            fromJS(onboardingIntegrations.meta),
                        ),
                    )
                },
            )
        })
    })

    describe('CREATE_INTEGRATION_SUCCESS', () => {
        it(
            'should store the new integration in the `integration` field, push it in the list of `integrations` and ' +
                'set the loading flag for integration update to `false`',
            () => {
                const newIntegration = {
                    id: 118712,
                    type: IntegrationType.GorgiasChat,
                }

                const integrationsState = initialState.mergeDeep(
                    fromJS({
                        integrations: [
                            {
                                id: 241,
                                type: IntegrationType.GorgiasChat,
                                meta: { foo: 'bar' },
                            },
                        ],
                    }),
                )

                const action = {
                    type: types.CREATE_INTEGRATION_SUCCESS,
                    resp: newIntegration,
                }

                expect(reducer(integrationsState, action)).toMatchSnapshot()
            },
        )
    })

    describe('UPDATE_INTEGRATION_SUCCESS', () => {
        it(
            'should store the new integration in the `integration` field, update it in the list of `integrations` and ' +
                'set the loading flag for integration update to `false`',
            () => {
                const integration = {
                    id: 118712,
                    type: IntegrationType.GorgiasChat,
                }
                const updatedIntegration = Object.assign({}, integration, {
                    meta: { foo: 'bar' },
                })

                const integrationsState = initialState.mergeDeep(
                    fromJS({
                        integrations: [
                            {
                                id: 241,
                                type: IntegrationType.GorgiasChat,
                                meta: { foo: 'bar' },
                            },
                            integration,
                        ],
                        state: { loading: { updateIntegration: 118712 } },
                    }),
                )

                const action = {
                    type: types.UPDATE_INTEGRATION_SUCCESS,
                    resp: updatedIntegration,
                }

                expect(reducer(integrationsState, action)).toMatchSnapshot()
            },
        )
    })

    describe('FETCH_CHAT_STATUS_START', () => {
        it('should set the loading flag for chatStatus to `true` and error flag for chatStatus to `false`', () => {
            const integrationsState = initialState.mergeDeep(
                fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.GorgiasChat,
                        },
                    ],
                    state: {
                        loading: { chatStatus: {} },
                        error: { chatStatus: {} },
                    },
                }),
            )

            const action = {
                id: 1,
                type: types.FETCH_CHAT_STATUS_START,
            }

            expect(reducer(integrationsState, action)).toMatchSnapshot()
        })
    })

    describe('FETCH_CHAT_STATUS_SUCCESS', () => {
        it('should store the chat status in the `status` field and set the loading flag for chatStatus to `false`', () => {
            const integrationsState = initialState.mergeDeep(
                fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.GorgiasChat,
                            meta: {},
                        },
                    ],
                    state: { loading: { chatStatus: {} } },
                }),
            )

            const action = {
                id: 1,
                chatStatus: GorgiasChatStatusEnum.ONLINE,
                type: types.FETCH_CHAT_STATUS_SUCCESS,
            }

            expect(reducer(integrationsState, action)).toMatchSnapshot()
        })
    })

    describe('FETCH_CHAT_STATUS_ERROR', () => {
        it('should set the loading flag for chatStatus to `false` and error flag for chatStatus to `true`', () => {
            const integrationsState = initialState.mergeDeep(
                fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.GorgiasChat,
                        },
                    ],
                    state: {
                        loading: { chatStatus: {} },
                        error: { chatStatus: {} },
                    },
                }),
            )

            const action = {
                id: 1,
                type: types.FETCH_CHAT_STATUS_ERROR,
                reason: `Failed`,
            }

            expect(reducer(integrationsState, action)).toMatchSnapshot()
        })
    })

    describe('FETCH_INTEGRATION_SUCCESS', () => {
        it('should sync detail into the integrations list', () => {
            const existingState = initialState.mergeDeep(
                fromJS({
                    integrations: [
                        {
                            ...httpIntegration,
                            id: 100,
                        },
                    ],
                }),
            )

            const detailIntegration = {
                ...httpIntegration,
                id: 100,
                http: {
                    ...baseHttp,
                    oauth2: {
                        token_url: 'https://auth.example.com/token',
                        client_id: 'my-client',
                        client_secret: '',
                        has_client_secret: true,
                        token_location: OAuth2TokenLocation.Header,
                        token_key: 'Authorization',
                    },
                },
            }

            const newState = reducer(existingState, {
                type: types.FETCH_INTEGRATION_SUCCESS,
                integration: detailIntegration,
            })

            expect(newState.get('integration').toJS()).toEqual(
                expect.objectContaining({ id: 100 }),
            )
            expect(
                newState
                    .get('integrations')
                    .get(0)
                    .getIn(['http', 'oauth2', 'client_id']),
            ).toBe('my-client')
        })
    })

    describe('FETCH_INTEGRATIONS_SUCCESS', () => {
        it('should preserve loaded detail over list data', () => {
            const detailData = fromJS({
                id: 100,
                name: 'HTTP Integration',
                type: 'http',
                deactivated_datetime: null,
                http: {
                    oauth2: {
                        token_url: 'https://auth.example.com/token',
                        client_id: 'my-client',
                        has_client_secret: true,
                    },
                },
            })

            const integrationsState = initialState.set(
                'integration',
                detailData,
            )

            const listData = [
                {
                    id: 100,
                    name: 'HTTP Integration',
                    type: 'http',
                    deactivated_datetime: null,
                },
            ]

            const newState = reducer(integrationsState, {
                type: types.FETCH_INTEGRATIONS_SUCCESS,
                resp: listData,
            })

            expect(
                newState
                    .get('integrations')
                    .get(0)
                    .getIn(['http', 'oauth2', 'client_id']),
            ).toBe('my-client')
        })

        it('should use list data when no detail is loaded', () => {
            const listData = [
                {
                    id: 200,
                    name: 'Another Integration',
                    type: 'http',
                    deactivated_datetime: null,
                },
            ]

            const newState = reducer(initialState, {
                type: types.FETCH_INTEGRATIONS_SUCCESS,
                resp: listData,
            })

            expect(newState.get('integrations').get(0).get('id')).toBe(200)
        })
    })

    describe('UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS', () => {
        it('should set the correct status on the migration object', () => {
            const integrationsState = initialState.mergeDeep(
                fromJS({
                    migrations: {
                        email: [
                            {
                                integration: {
                                    id: 1,
                                    meta: {
                                        address: 'address@gorgias.com',
                                    },
                                },
                                status: EmailMigrationInboundVerificationStatus.Initiated,
                            },
                        ],
                    },
                }),
            )

            const action = {
                type: types.UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
                integrationId: 1,
                emailMigrationVerificationStatus:
                    EmailMigrationInboundVerificationStatus.InboundPending,
            }
            expect(
                (
                    reducer(integrationsState, action).toJS() as {
                        migrations: {
                            email: EmailMigrationInboundVerification[]
                        }
                    }
                ).migrations?.email,
            ).toEqual([
                {
                    integration: {
                        id: 1,
                        meta: {
                            address: 'address@gorgias.com',
                        },
                    },
                    status: EmailMigrationInboundVerificationStatus.InboundPending,
                },
            ])
        })
    })
})
