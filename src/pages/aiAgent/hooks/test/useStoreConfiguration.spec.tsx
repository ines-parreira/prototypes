import React from 'react'

import {
    QueryClient,
    QueryClientProvider,
    UseQueryResult,
} from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { StoreConfigurationsResponse } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

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

    const createWrapper = ({ children }: { children: React.ReactNode }) => (
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
        } as Partial<
            UseQueryResult<
                AxiosResponse<StoreConfigurationsResponse, any>,
                unknown
            >
        > as UseQueryResult<
            AxiosResponse<StoreConfigurationsResponse, any>,
            unknown
        >)

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

        const mockAxiosResponse: AxiosResponse<StoreConfigurationsResponse> = {
            data: {
                storeConfigurations: [storeConfig, anotherStoreConfig],
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                headers: {} as any,
            } as InternalAxiosRequestConfig,
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockAxiosResponse,
        } as Partial<
            UseQueryResult<
                AxiosResponse<StoreConfigurationsResponse, any>,
                unknown
            >
        > as UseQueryResult<
            AxiosResponse<StoreConfigurationsResponse, any>,
            unknown
        >)

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

        const mockAxiosResponse: AxiosResponse<StoreConfigurationsResponse> = {
            data: {
                storeConfigurations: [anotherStoreConfig],
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                headers: {} as any,
            } as InternalAxiosRequestConfig,
        }

        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            isLoading: false,
            data: mockAxiosResponse,
        } as Partial<
            UseQueryResult<
                AxiosResponse<StoreConfigurationsResponse, any>,
                unknown
            >
        > as UseQueryResult<
            AxiosResponse<StoreConfigurationsResponse, any>,
            unknown
        >)

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
        } as Partial<
            UseQueryResult<
                AxiosResponse<StoreConfigurationsResponse, any>,
                unknown
            >
        > as UseQueryResult<
            AxiosResponse<StoreConfigurationsResponse, any>,
            unknown
        >)

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
