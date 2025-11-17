import type React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import type { QueryClient, UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import type { StoreConfigurationsResponse } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useStoreConfiguration } from '../useStoreConfiguration'

jest.mock('models/aiAgent/queries')

const mockUseGetStoresConfigurationForAccount = assumeMock(
    useGetStoresConfigurationForAccount,
)

describe('useStoreConfiguration', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = mockQueryClient()
    })

    const createWrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const accountDomain = 'test-account'
    const shopName = 'test-store'

    it('should return isLoading true when data is loading', async () => {
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: true,
            data: undefined,
        } as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(
            () => useStoreConfiguration({ shopName, accountDomain }),
            { wrapper: createWrapper },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.storeConfiguration).toBeUndefined()
        expect(mockUseGetStoresConfigurationForAccount).toHaveBeenCalledWith(
            { accountDomain },
            { retry: 1, refetchOnWindowFocus: false, enabled: true },
        )
    })

    it('should return store configuration when data is loaded', async () => {
        const storeConfig = getStoreConfigurationFixture({
            storeName: shopName,
        })
        const anotherStoreConfig = getStoreConfigurationFixture({
            storeName: 'another-store',
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [storeConfig, anotherStoreConfig],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(
            () => useStoreConfiguration({ shopName, accountDomain }),
            { wrapper: createWrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.storeConfiguration).toEqual(storeConfig)
        })
    })

    it('should return undefined when no matching store configuration is found', async () => {
        const anotherStoreConfig = getStoreConfigurationFixture({
            storeName: 'another-store',
        })

        const mockResponse: StoreConfigurationsResponse = {
            storeConfigurations: [anotherStoreConfig],
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockResponse,
        } as UseQueryResult<StoreConfigurationsResponse, unknown>)

        const { result } = renderHook(
            () => useStoreConfiguration({ shopName, accountDomain }),
            { wrapper: createWrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.storeConfiguration).toBeUndefined()
        })
    })

    it('should respect the enabled parameter', async () => {
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: undefined,
        } as UseQueryResult<StoreConfigurationsResponse, unknown>)

        renderHook(
            () =>
                useStoreConfiguration({
                    shopName,
                    accountDomain,
                    enabled: false,
                }),
            { wrapper: createWrapper },
        )

        expect(mockUseGetStoresConfigurationForAccount).toHaveBeenCalledWith(
            { accountDomain },
            { retry: 1, refetchOnWindowFocus: false, enabled: false },
        )
    })
})
