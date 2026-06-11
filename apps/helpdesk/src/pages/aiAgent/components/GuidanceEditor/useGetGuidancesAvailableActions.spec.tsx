import { renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import {
    useListServiceConnectionsByAppIds,
    useListServiceConnectionStoresByConnectionIds,
} from 'models/integration/queries'
import type {
    ServiceConnectionApiDTO,
    StoreForServiceConnectionApiDTO,
} from 'models/integration/types/serviceConnection'
import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useGetGuidancesAvailableActions } from './useGetGuidancesAvailableActions'

jest.mock('rest_api/workflows_api/client', () => ({
    getGorgiasWfApiClient: jest.fn(),
}))

jest.mock('models/workflows/queries', () => ({
    CACHE_TIME_MS: 0,
    STALE_TIME_MS: 0,
}))

jest.mock('hooks/integrations/useActionCentralizedLibraryEnabled', () => ({
    useActionCentralizedLibraryEnabled: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListStores: jest.fn(),
}))

jest.mock('models/integration/queries', () => ({
    useListServiceConnectionsByAppIds: jest.fn(),
    useListServiceConnectionStoresByConnectionIds: jest.fn(),
}))

const mockGetGorgiasWfApiClient = getGorgiasWfApiClient as jest.Mock
const mockUseActionCentralizedLibraryEnabled = jest.mocked(
    useActionCentralizedLibraryEnabled,
)
const mockUseListStores = jest.mocked(useListStores)
const mockUseListServiceConnectionsByAppIds = jest.mocked(
    useListServiceConnectionsByAppIds,
)
const mockUseListServiceConnectionStoresByConnectionIds = jest.mocked(
    useListServiceConnectionStoresByConnectionIds,
)

const connectionsQuery = (
    connections: Partial<ServiceConnectionApiDTO>[],
): UseQueryResult<ServiceConnectionApiDTO[]> =>
    ({
        isSuccess: true,
        isInitialLoading: false,
        isError: false,
        data: connections as ServiceConnectionApiDTO[],
        error: null,
    }) as unknown as UseQueryResult<ServiceConnectionApiDTO[]>

const storesQuery = (
    stores: Partial<StoreForServiceConnectionApiDTO>[],
): UseQueryResult<StoreForServiceConnectionApiDTO[]> =>
    ({
        isSuccess: true,
        isInitialLoading: false,
        isError: false,
        data: stores as StoreForServiceConnectionApiDTO[],
        error: null,
    }) as unknown as UseQueryResult<StoreForServiceConnectionApiDTO[]>

const mockAllActions = [
    {
        id: 'toto-id',
        name: 'TOTO action',
        enabled: true,
        requires_auth: false,
        has_missing_values: false,
        inputs: [],
        values: {},
    },
    {
        id: 'foobar-id',
        name: 'Foobar action',
        enabled: false,
        requires_auth: false,
        has_missing_values: false,
        inputs: [],
        values: {},
    },
]

describe('useGetGuidancesAvailableActions', () => {
    beforeEach(() => {
        const mockApiClient = {
            StoreWfConfigurationController_list: jest
                .fn()
                .mockResolvedValue({ data: mockAllActions }),
        }
        mockGetGorgiasWfApiClient.mockResolvedValue(mockApiClient)

        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: false,
            milestone: 'OFF',
            isLoading: false,
        })
        mockUseListStores.mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof useListStores>)
        mockUseListServiceConnectionsByAppIds.mockReturnValue([])
        mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([])
    })

    it('should pass through enabled, requiresAuth, and hasMissingValues from the API', async () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        const { result } = renderHook(
            () => useGetGuidancesAvailableActions('store1', 'shopify'),
            { wrapper: QueryClientProvider },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.guidanceActions).toEqual([
            {
                name: 'TOTO action',
                value: 'toto-id',
                enabled: true,
                requiresAuth: false,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            },
            {
                name: 'Foobar action',
                value: 'foobar-id',
                enabled: false,
                requiresAuth: false,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            },
        ])
    })

    it('should derive missingValuesDetails from inputs when has_missing_values is true', async () => {
        const mockApiClient = {
            StoreWfConfigurationController_list: jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 'missing-id',
                        name: 'Missing action',
                        enabled: true,
                        requires_auth: false,
                        has_missing_values: true,
                        inputs: [
                            { id: 'input-1', name: 'Input one' },
                            { id: 'input-2', name: 'Input two' },
                        ],
                        values: { 'input-1': 'value-1' },
                    },
                ],
            }),
        }
        mockGetGorgiasWfApiClient.mockResolvedValue(mockApiClient)

        const { QueryClientProvider } = mockQueryClientProvider()
        const { result } = renderHook(
            () => useGetGuidancesAvailableActions('store1', 'shopify'),
            { wrapper: QueryClientProvider },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.guidanceActions).toEqual([
            {
                name: 'Missing action',
                value: 'missing-id',
                enabled: true,
                requiresAuth: false,
                hasMissingValues: true,
                missingValuesDetails: [{ inputNames: ['Input two'] }],
            },
        ])
    })

    it('should pass through requiresAuth when API reports it', async () => {
        const mockApiClient = {
            StoreWfConfigurationController_list: jest.fn().mockResolvedValue({
                data: [
                    {
                        id: 'auth-id',
                        name: 'Auth action',
                        enabled: true,
                        requires_auth: true,
                        has_missing_values: false,
                        inputs: [],
                        values: {},
                    },
                ],
            }),
        }
        mockGetGorgiasWfApiClient.mockResolvedValue(mockApiClient)

        const { QueryClientProvider } = mockQueryClientProvider()
        const { result } = renderHook(
            () => useGetGuidancesAvailableActions('store1', 'shopify'),
            { wrapper: QueryClientProvider },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.guidanceActions[0]).toEqual({
            name: 'Auth action',
            value: 'auth-id',
            enabled: true,
            requiresAuth: true,
            hasMissingValues: false,
            missingValuesDetails: undefined,
        })
    })

    it('should not fetch when shopType is not shopify', () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        renderHook(() => useGetGuidancesAvailableActions('store1', 'magento'), {
            wrapper: QueryClientProvider,
        })

        expect(mockGetGorgiasWfApiClient).not.toHaveBeenCalled()
    })

    it('should not fetch when shopName is empty', () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        renderHook(() => useGetGuidancesAvailableActions('', 'shopify'), {
            wrapper: QueryClientProvider,
        })

        expect(mockGetGorgiasWfApiClient).not.toHaveBeenCalled()
    })

    describe('when the action centralized library flag is enabled', () => {
        const authActionWithApp = {
            id: 'auth-id',
            name: 'Auth action',
            enabled: true,
            requires_auth: true,
            has_missing_values: false,
            inputs: [],
            values: {},
            apps: [{ type: 'app', app_id: 'mailchimp' }],
        }

        beforeEach(() => {
            mockUseActionCentralizedLibraryEnabled.mockReturnValue({
                isEnabled: true,
                milestone: 'MILESTONE-1',
                isLoading: false,
            })
            mockUseListStores.mockReturnValue({
                data: {
                    data: {
                        data: [
                            {
                                name: 'store1',
                                store_integration_id: 42,
                            },
                        ],
                    },
                },
            } as unknown as ReturnType<typeof useListStores>)

            const mockApiClient = {
                StoreWfConfigurationController_list: jest
                    .fn()
                    .mockResolvedValue({ data: [authActionWithApp] }),
            }
            mockGetGorgiasWfApiClient.mockResolvedValue(mockApiClient)
        })

        it('overrides requiresAuth to false when a service connection is assigned to the current store', async () => {
            mockUseListServiceConnectionsByAppIds.mockReturnValue([
                connectionsQuery([{ id: 'c1', status: 'active' }]),
            ])
            mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
                storesQuery([{ store_id: 42 }]),
            ])

            const { QueryClientProvider } = mockQueryClientProvider()
            const { result } = renderHook(
                () => useGetGuidancesAvailableActions('store1', 'shopify'),
                { wrapper: QueryClientProvider },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.guidanceActions[0]).toEqual({
                name: 'Auth action',
                value: 'auth-id',
                enabled: true,
                requiresAuth: false,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            })
        })

        it('keeps requiresAuth true when no connection is assigned to the current store', async () => {
            mockUseListServiceConnectionsByAppIds.mockReturnValue([
                connectionsQuery([{ id: 'c1', status: 'active' }]),
            ])
            mockUseListServiceConnectionStoresByConnectionIds.mockReturnValue([
                storesQuery([{ store_id: 99 }]),
            ])

            const { QueryClientProvider } = mockQueryClientProvider()
            const { result } = renderHook(
                () => useGetGuidancesAvailableActions('store1', 'shopify'),
                { wrapper: QueryClientProvider },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.guidanceActions[0]).toEqual({
                name: 'Auth action',
                value: 'auth-id',
                enabled: true,
                requiresAuth: true,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            })
        })

        it('keeps requiresAuth true when no service connection exists for the app', async () => {
            mockUseListServiceConnectionsByAppIds.mockReturnValue([
                connectionsQuery([]),
            ])

            const { QueryClientProvider } = mockQueryClientProvider()
            const { result } = renderHook(
                () => useGetGuidancesAvailableActions('store1', 'shopify'),
                { wrapper: QueryClientProvider },
            )

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.guidanceActions[0].requiresAuth).toBe(true)
        })
    })
})
