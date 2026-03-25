import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import type { ComputeActivationPercentage } from '../useStoreActivations'
import {
    computeActivationPercentage,
    useStoreActivations,
    useStoreConfigurations,
} from '../useStoreActivations'

jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')
const useStoreConfigurationForAccountMock = assumeMock(
    useStoreConfigurationForAccount,
)

jest.mock('pages/aiAgent/hooks/useStoresConfigurationMutation')
const useStoresConfigurationMutationMock = assumeMock(
    useStoresConfigurationMutation,
)

describe('computeActivationPercentage', () => {
    const createStoreActivation = (
        chatEnabled: boolean,
        emailEnabled: boolean,
        salesEnabled: boolean,
    ): ComputeActivationPercentage => ({
        sales: {
            enabled: salesEnabled,
        },
        support: {
            chat: {
                enabled: chatEnabled,
            },
            email: {
                enabled: emailEnabled,
            },
        },
    })

    it('returns 0% when no stores are present', () => {
        const state = {}
        expect(computeActivationPercentage(state)).toBe(0)
    })

    it('returns 0% when all features are disabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(0)
    })

    it('returns 33% when only chat is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 33% when only email is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 33% when only sales is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, false, true),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 67% when chat and email are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 67% when chat and sales are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, false, true),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 67% when email and sales are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, true, true),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 100% when all features are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
        }
        expect(computeActivationPercentage(state)).toBe(100)
    })

    it('returns 50% when one store has all features enabled and another has none', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(false, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(50)
    })

    it('returns 83% when one store has all features enabled and another has one disabled', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(83)
    })

    it('returns 78% when one store has all features enabled and another has two features enabled', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(true, true, false),
            store3: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(78)
    })
})

describe('useStoreConfigurations', () => {
    it('should return storeConfigurations sorted alphabetically', () => {
        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                getStoreConfigurationFixture({ storeName: 'store2' }),
                getStoreConfigurationFixture({ storeName: 'store1' }),
                getStoreConfigurationFixture({ storeName: 'store3' }),
            ],
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useStoreConfigurations('my-account'),
        )
        expect(result.current.storeConfigurations).toHaveLength(3)
        expect(result.current.storeConfigurations[0].storeName).toEqual(
            'store1',
        )
        expect(result.current.storeConfigurations[1].storeName).toEqual(
            'store2',
        )
        expect(result.current.storeConfigurations[2].storeName).toEqual(
            'store3',
        )
    })

    it('should return storeNames sorted alphabetically', () => {
        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                getStoreConfigurationFixture({ storeName: 'store2' }),
                getStoreConfigurationFixture({ storeName: 'store1' }),
                getStoreConfigurationFixture({ storeName: 'store3' }),
            ],
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useStoreConfigurations('my-account'),
        )
        expect(result.current.storeNames).toHaveLength(3)
        expect(result.current.storeNames).toEqual([
            'store1',
            'store2',
            'store3',
        ])
    })

    it('should return storeConfigurations for a single store', () => {
        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                getStoreConfigurationFixture({ storeName: 'store1' }),
            ],
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useStoreConfigurations('my-account', 'store1'),
        )
        expect(result.current.storeConfigurations).toHaveLength(1)
        expect(result.current.storeConfigurations[0].storeName).toEqual(
            'store1',
        )
    })
})

describe('useStoreActivations', () => {
    const defaultState = {
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
        currentUser: fromJS({
            role: {
                name: 'admin',
            },
        }),
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    deleted_datetime: null,
                    mappings: [],
                    meta: {
                        shop_id: 54899465,
                        shop_domain: 'store1.com',
                        currency: 'USD',
                        shop_display_name: 'Store 1',
                        shop_name: 'store1',
                    },
                    deactivated_datetime: null,
                    name: 'store1',
                    uri: '/api/integrations/1/',
                    type: 'shopify',
                    created_datetime: '2020-01-28T22:19:15.604153+00:00',
                    updated_datetime: '2020-01-28T22:19:15.604157+00:00',
                },
                {
                    id: 2,
                    deleted_datetime: null,
                    mappings: [],
                    meta: {
                        shop_id: 54899466,
                        shop_domain: 'store2.com',
                        currency: 'USD',
                        shop_display_name: 'Store 2',
                        shop_name: 'store2',
                    },
                    deactivated_datetime: null,
                    name: 'store2',
                    uri: '/api/integrations/2/',
                    type: 'shopify',
                    created_datetime: '2020-01-28T22:19:15.604153+00:00',
                    updated_datetime: '2020-01-28T22:19:15.604157+00:00',
                },
            ],
        }),
        automate: fromJS({
            storeIntegrations: {
                store1: {
                    id: 1,
                    name: 'store1',
                    type: 'shopify',
                },
                store2: {
                    id: 2,
                    name: 'store2',
                    type: 'shopify',
                },
            },
        }),
    }

    const renderHookWithRouter = ({
        initialEntry = '/',
        state = defaultState,
    }: {
        initialEntry?: string
        state?: Record<string, any>
    } = {}) => {
        const queryClient = mockQueryClient()

        const history = createMemoryHistory({ initialEntries: [initialEntry] })
        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(state)}>
                        <Route path="/:shopName?">{children}</Route>
                    </Provider>
                </QueryClientProvider>
            </Router>
        )

        return {
            ...renderHook(() => useStoreActivations(), { wrapper }),
            history,
        }
    }

    const upsertStoresConfiguration = jest.fn()
    beforeEach(() => {
        jest.clearAllMocks()
        useStoresConfigurationMutationMock.mockReturnValue({
            upsertStoresConfiguration: upsertStoresConfiguration,
            error: null,
            isLoading: false,
        })
        useStoreConfigurationForAccountMock.mockReturnValue({
            storeConfigurations: [
                getStoreConfigurationFixture({ storeName: 'store1' }),
                getStoreConfigurationFixture({ storeName: 'store2' }),
            ],
            isLoading: false,
        })
    })

    describe('storeActivations', () => {
        it('should return all storeActivations when not on a single store page', async () => {
            const { result } = renderHookWithRouter({ initialEntry: '/' })

            await waitFor(() => {
                expect(result.current.storeActivations['store1']).toBeTruthy()
                expect(result.current.storeActivations['store2']).toBeTruthy()
            })
        })

        it('should return only storeActivations for the current store when on a single store page', async () => {
            const { result } = renderHookWithRouter({ initialEntry: '/store1' })

            await waitFor(() => {
                expect(result.current.storeActivations['store1']).toBeTruthy()
                expect(result.current.storeActivations['store2']).toBeFalsy()
            })
        })

        it('should filter store that do not exist', async () => {
            const { result } = renderHookWithRouter({
                initialEntry: '/',
                state: {
                    ...defaultState,
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                deleted_datetime: null,
                                mappings: [],
                                meta: {
                                    shop_id: 54899465,
                                    shop_domain: 'store1.com',
                                    currency: 'USD',
                                    shop_display_name: 'Store 1',
                                    shop_name: 'store1',
                                },
                                deactivated_datetime: null,
                                name: 'store1',
                                uri: '/api/integrations/1/',
                                type: 'shopify',
                                created_datetime:
                                    '2020-01-28T22:19:15.604153+00:00',
                                updated_datetime:
                                    '2020-01-28T22:19:15.604157+00:00',
                            },
                        ],
                    }),
                },
            })

            await waitFor(() => {
                expect(result.current.storeActivations['store1']).toBeTruthy()
                expect(result.current.storeActivations['store2']).toBeFalsy()
            })
        })
    })

    describe('migrateToNewPricing', () => {
        it('should update all store configuration even on a single store page', async () => {
            mockFeatureFlags({
                [FeatureFlagKey.AiAgentNewActivationXp]: true,
            })
            const { result } = renderHookWithRouter({
                initialEntry: '/store1',
            })
            await result.current.migrateToNewPricing()

            await waitFor(() => {
                expect(upsertStoresConfiguration).toHaveBeenCalledTimes(1)

                const input: StoreConfiguration[] =
                    upsertStoresConfiguration.mock.calls[0][0]
                expect(input).toHaveLength(2)
                expect(input).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            storeName: 'store1',
                        }),
                        expect.objectContaining({
                            storeName: 'store2',
                        }),
                    ]),
                )
            })
        })

        it('should filter store that do not exist', async () => {
            mockFeatureFlags({
                [FeatureFlagKey.AiAgentNewActivationXp]: true,
            })
            const { result } = renderHookWithRouter({
                initialEntry: '/',
                state: {
                    ...defaultState,
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                deleted_datetime: null,
                                mappings: [],
                                meta: {
                                    shop_id: 54899465,
                                    shop_domain: 'store1.com',
                                    currency: 'USD',
                                    shop_display_name: 'Store 1',
                                    shop_name: 'store1',
                                },
                                deactivated_datetime: null,
                                name: 'store1',
                                uri: '/api/integrations/1/',
                                type: 'shopify',
                                created_datetime:
                                    '2020-01-28T22:19:15.604153+00:00',
                                updated_datetime:
                                    '2020-01-28T22:19:15.604157+00:00',
                            },
                        ],
                    }),
                },
            })
            await result.current.migrateToNewPricing()

            await waitFor(() => {
                expect(upsertStoresConfiguration).toHaveBeenCalledTimes(1)

                const input: StoreConfiguration[] =
                    upsertStoresConfiguration.mock.calls[0][0]
                expect(input).toHaveLength(1)
                expect(input).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            storeName: 'store1',
                        }),
                    ]),
                )
            })
        })
    })
})
