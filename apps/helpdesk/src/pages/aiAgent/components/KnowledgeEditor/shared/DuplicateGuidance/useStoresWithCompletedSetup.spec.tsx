import type React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import type { StoreConfigurationsResponse } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import type { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { useStoresWithCompletedSetup } from './useStoresWithCompletedSetup'

jest.mock('models/aiAgent/queries')
jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockUseGetStoresConfigurationForAccount = assumeMock(
    useGetStoresConfigurationForAccount,
)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

const createMockStoreIntegration = (name: string, id: number) => ({
    id,
    name,
    type: IntegrationType.Shopify,
    meta: {
        shop_name: name,
    },
})

const defaultState: RootState = {
    currentAccount: fromJS({
        domain: 'test-account.gorgias.com',
        current_subscription: {
            products: {},
            status: 'active',
        },
    }),
    billing: fromJS({
        products: {},
    }),
    integrations: fromJS({
        integrations: [
            createMockStoreIntegration('store-1', 1),
            createMockStoreIntegration('store-2', 2),
            createMockStoreIntegration('store-3', 3),
        ],
    }),
} as RootState

describe('useStoresWithCompletedSetup', () => {
    let queryClient: ReturnType<typeof mockQueryClient>

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = mockQueryClient()

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    const createWrapper = ({ children }: { children?: React.ReactNode }) => (
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    it('returns stores with wizard.completedDatetime !== null', () => {
        const storeConfig1 = getStoreConfigurationFixture({
            storeName: 'store-1',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: '2024-01-01T00:00:00.000Z',
            },
        })

        const storeConfig2 = getStoreConfigurationFixture({
            storeName: 'store-2',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: null, // In progress
            },
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [storeConfig1, storeConfig2],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toHaveLength(1)
        expect(result.current[0].name).toBe('store-1')
    })

    it('returns stores without wizard object (legacy stores)', () => {
        const storeConfig1 = getStoreConfigurationFixture({
            storeName: 'store-1',
            wizard: undefined, // Legacy store
        })

        const storeConfig2 = getStoreConfigurationFixture({
            storeName: 'store-2',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: null, // In progress
            },
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [storeConfig1, storeConfig2],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toHaveLength(1)
        expect(result.current[0].name).toBe('store-1')
    })

    it('returns empty array while loading', () => {
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: true,
            data: undefined,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toEqual([])
    })

    it('returns empty array when data is not available', () => {
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toEqual([])
    })

    it('filters out stores with wizard.completedDatetime === null', () => {
        const storeConfig1 = getStoreConfigurationFixture({
            storeName: 'store-1',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: null, // In progress
            },
        })

        const storeConfig2 = getStoreConfigurationFixture({
            storeName: 'store-2',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: null, // In progress
            },
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [storeConfig1, storeConfig2],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toEqual([])
    })

    it('handles mixed store states correctly', () => {
        const completedStore = getStoreConfigurationFixture({
            storeName: 'store-1',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: '2024-01-01T00:00:00.000Z',
            },
        })

        const inProgressStore = getStoreConfigurationFixture({
            storeName: 'store-2',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: null,
            },
        })

        const legacyStore = getStoreConfigurationFixture({
            storeName: 'store-3',
            wizard: undefined,
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [completedStore, inProgressStore, legacyStore],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toHaveLength(2)
        expect(result.current.map((store) => store.name)).toEqual([
            'store-1',
            'store-3',
        ])
    })

    it('only returns stores that exist in both integrations and configurations', () => {
        const storeConfig1 = getStoreConfigurationFixture({
            storeName: 'store-1',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: '2024-01-01T00:00:00.000Z',
            },
        })

        // This store exists in config but not in integrations
        const storeConfig4 = getStoreConfigurationFixture({
            storeName: 'store-4-not-in-integrations',
            wizard: {
                stepName: null,
                stepData: {
                    enabledChannels: null,
                    isAutoresponderTurnedOff: null,
                    onCompletePathway: null,
                },
                completedDatetime: '2024-01-01T00:00:00.000Z',
            },
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [storeConfig1, storeConfig4],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(result.current).toHaveLength(1)
        expect(result.current[0].name).toBe('store-1')
    })

    it('calls useGetStoresConfigurationForAccount with correct accountDomain', () => {
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: { storeConfigurations: [] },
        } as unknown as UseQueryResult<StoreConfigurationsResponse, unknown>)

        renderHook(useStoresWithCompletedSetup, {
            wrapper: createWrapper,
        })

        expect(mockUseGetStoresConfigurationForAccount).toHaveBeenCalledWith({
            accountDomain: 'test-account.gorgias.com',
        })
    })
})
