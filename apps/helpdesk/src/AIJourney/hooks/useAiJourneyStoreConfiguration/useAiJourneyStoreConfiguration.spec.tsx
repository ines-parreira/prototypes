import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import {
    queryKeys,
    useCreateOrUpdateStoreConfiguration,
    useGetStoreConfiguration,
} from '@gorgias/convert-queries'

import { useAiJourneyStoreConfiguration } from './useAiJourneyStoreConfiguration'

jest.mock('@gorgias/convert-queries', () => ({
    queryKeys: {
        storeConfigurations: {
            getStoreConfiguration: jest.fn((id) => ['storeConfiguration', id]),
        },
    },
    useGetStoreConfiguration: jest.fn(),
    useCreateOrUpdateStoreConfiguration: jest.fn(),
}))

const mockUseGetStoreConfiguration = useGetStoreConfiguration as jest.Mock
const mockUseCreateOrUpdateStoreConfiguration =
    useCreateOrUpdateStoreConfiguration as jest.Mock
const mockMutateAsync = jest.fn()

let queryClient: QueryClient

const createWrapper = () => {
    queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useAiJourneyStoreConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGetStoreConfiguration.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            isFetched: false,
        })
        mockUseCreateOrUpdateStoreConfiguration.mockReturnValue({
            mutateAsync: mockMutateAsync,
        })
    })

    describe('data fetching', () => {
        it('should return storeConfiguration from the query response', () => {
            const mockStoreConfig = {
                brand_name: 'Test Store',
                sms_sender_integration_id: 1,
                sms_sender_number: '+15550001',
                texas_exclusion_enabled: false,
            }
            mockUseGetStoreConfiguration.mockReturnValue({
                data: { data: mockStoreConfig },
                isLoading: false,
                error: null,
                isFetched: true,
            })

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            expect(result.current.storeConfiguration).toEqual(mockStoreConfig)
        })

        it('should return undefined storeConfiguration when data is not yet available', () => {
            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            expect(result.current.storeConfiguration).toBeUndefined()
        })

        it('should forward isLoading, error, and isFetched from the query', () => {
            const mockError = new Error('Network failure')
            mockUseGetStoreConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
                isFetched: true,
            })

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper: createWrapper() },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe(mockError)
            expect(result.current.isFetched).toBe(true)
        })

        it('should call useGetStoreConfiguration with enabled: false when storeIntegrationId is undefined', () => {
            renderHook(() => useAiJourneyStoreConfiguration(undefined), {
                wrapper: createWrapper(),
            })

            expect(mockUseGetStoreConfiguration).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })

        it('should call useGetStoreConfiguration with enabled: true when storeIntegrationId is defined', () => {
            renderHook(() => useAiJourneyStoreConfiguration(42), {
                wrapper: createWrapper(),
            })

            expect(mockUseGetStoreConfiguration).toHaveBeenCalledWith(
                42,
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: true }),
                }),
            )
        })
    })

    describe('saveConfiguration', () => {
        it('should call mutateAsync with the storeIntegrationId and configuration data', async () => {
            mockMutateAsync.mockResolvedValue(undefined)
            const configuration = {
                brand_name: 'My Store',
                sms_sender_integration_id: 1,
                sms_sender_number: '+15550001',
                texas_exclusion_enabled: false,
            }

            const wrapper = createWrapper()
            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper },
            )

            await act(async () => {
                await result.current.saveConfiguration(configuration)
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                storeIntegrationId: 42,
                data: configuration,
            })
        })

        it('should invalidate the storeConfiguration query after a successful save', async () => {
            mockMutateAsync.mockResolvedValue(undefined)

            const wrapper = createWrapper()
            const invalidateQueriesSpy = jest
                .spyOn(queryClient, 'invalidateQueries')
                .mockResolvedValue(undefined)

            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(42),
                { wrapper },
            )

            await act(async () => {
                await result.current.saveConfiguration({ brand_name: 'Test' })
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey:
                    queryKeys.storeConfigurations.getStoreConfiguration(42),
            })
        })

        it('should not call mutateAsync when storeIntegrationId is undefined', async () => {
            const { result } = renderHook(
                () => useAiJourneyStoreConfiguration(undefined),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.saveConfiguration({ brand_name: 'Test' })
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })
    })
})
