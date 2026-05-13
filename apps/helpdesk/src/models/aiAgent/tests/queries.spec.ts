import { createElement } from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { fromJS } from 'immutable'

import * as accountFixtures from 'fixtures/account'
import {
    storeConfigurationKeys,
    trialsKeys,
    useGetTrials,
    useOptOutAiAgentTrialUpgradeMutation,
    useOptOutSalesTrialUpgradeMutation,
    useStartAiAgentTrialMutation,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import * as configurationResources from 'models/aiAgent/resources/configuration'
import { initialState } from 'state/currentAccount/reducers'

jest.mock('models/aiAgent/resources/configuration')

type RenderHookOptions = NonNullable<Parameters<typeof renderHook>[1]>

const renderHookWithQueryClient = <TResult>(
    hook: () => TResult,
    options?: RenderHookOptions,
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    const { wrapper: ExtraWrapper, ...renderHookOptions } = options ?? {}

    const result = renderHook(hook, {
        ...renderHookOptions,
        wrapper: ({ children }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                ExtraWrapper
                    ? createElement(ExtraWrapper, undefined, children)
                    : children,
            ),
    })

    return { ...result, queryClient }
}

const defaultState = {
    currentAccount: initialState.mergeDeep(
        fromJS({
            ...accountFixtures.account,
            domain: 'test-domain',
        }),
    ),
}

describe('aiAgent queries', () => {
    let mockStartSalesTrial: jest.MockedFunction<
        typeof configurationResources.startSalesTrial
    >
    let mockOptOutSalesTrialUpgrade: jest.MockedFunction<
        typeof configurationResources.optOutSalesTrialUpgrade
    >
    let mockOptOutAiAgentTrialUpgrade: jest.MockedFunction<
        typeof configurationResources.optOutAiAgentTrialUpgrade
    >
    let mockStartAiAgentTrial: jest.MockedFunction<
        typeof configurationResources.startAiAgentTrial
    >
    let mockGetTrials: jest.MockedFunction<
        typeof configurationResources.getTrials
    >

    beforeEach(() => {
        mockStartSalesTrial = jest.mocked(
            configurationResources.startSalesTrial,
        )
        mockOptOutSalesTrialUpgrade = jest.mocked(
            configurationResources.optOutSalesTrialUpgrade,
        )
        mockOptOutAiAgentTrialUpgrade = jest.mocked(
            configurationResources.optOutAiAgentTrialUpgrade,
        )
        mockStartAiAgentTrial = jest.mocked(
            configurationResources.startAiAgentTrial,
        )
        mockGetTrials = jest.mocked(configurationResources.getTrials)
    })

    describe('useStartSalesTrialMutation', () => {
        it('should call startSalesTrial with correct parameters', async () => {
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result } = renderHook(() => useStartSalesTrialMutation(), {
                storeState: defaultState,
            })

            await result.current.mutateAsync(['test-store'])

            expect(mockStartSalesTrial).toHaveBeenCalledWith(
                'test-domain',
                'shopify',
                'test-store',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result, queryClient } = renderHookWithQueryClient(
                () => useStartSalesTrialMutation(),
                { storeState: defaultState },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(['test-store'])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () =>
                    useStartSalesTrialMutation({
                        onSuccess: onSuccessMock,
                    }),
                { storeState: defaultState },
            )

            await result.current.mutateAsync(['test-store'])

            expect(onSuccessMock).toHaveBeenCalled()
        })
    })

    describe('useOptOutSalesTrialUpgradeMutation', () => {
        it('should call optOutSalesTrialUpgrade with correct parameters', async () => {
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () => useOptOutSalesTrialUpgradeMutation(),
                { storeState: defaultState },
            )

            await result.current.mutateAsync([])

            expect(mockOptOutSalesTrialUpgrade).toHaveBeenCalledWith(
                'test-domain',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result, queryClient } = renderHookWithQueryClient(
                () => useOptOutSalesTrialUpgradeMutation(),
                { storeState: defaultState },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () =>
                    useOptOutSalesTrialUpgradeMutation({
                        onSuccess: onSuccessMock,
                    }),
                { storeState: defaultState },
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should show error notification on failure', async () => {
            const mockError = new Error('Network error')
            mockOptOutSalesTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHook(
                () => useOptOutSalesTrialUpgradeMutation(),
                { storeState: defaultState },
            )

            await expect(result.current.mutateAsync([])).rejects.toThrow(
                'Network error',
            )

            expect(
                await screen.findByRole('status', {
                    name: 'Failed to upgrade plan. Please try again later.',
                }),
            ).toBeInTheDocument()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockOptOutSalesTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHook(
                () =>
                    useOptOutSalesTrialUpgradeMutation({
                        onError: onErrorMock,
                    }),
                { storeState: defaultState },
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })
    })

    describe('useStartAiAgentTrialMutation', () => {
        it('should call startAiAgentTrial with correct parameters', async () => {
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () => useStartAiAgentTrialMutation(),
                { storeState: defaultState },
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(mockStartAiAgentTrial).toHaveBeenCalledWith(
                'test-domain',
                'shopify',
                'test-store',
                true,
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result, queryClient } = renderHookWithQueryClient(
                () => useStartAiAgentTrialMutation(),
                { storeState: defaultState },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () =>
                    useStartAiAgentTrialMutation({
                        onSuccess: onSuccessMock,
                    }),
                { storeState: defaultState },
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockStartAiAgentTrial.mockRejectedValue(mockError)

            const { result } = renderHook(
                () =>
                    useStartAiAgentTrialMutation({
                        onError: onErrorMock,
                    }),
                { storeState: defaultState },
            )

            try {
                await result.current.mutateAsync([
                    'shopify',
                    'test-store',
                    true,
                ])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(
                mockError,
                ['shopify', 'test-store', true],
                undefined,
            )
        })
    })

    describe('useOptOutAiAgentTrialUpgradeMutation', () => {
        it('should call optOutAiAgentTrialUpgrade with correct parameters', async () => {
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () => useOptOutAiAgentTrialUpgradeMutation(),
                { storeState: defaultState },
            )

            await result.current.mutateAsync([])

            expect(mockOptOutAiAgentTrialUpgrade).toHaveBeenCalledWith(
                'test-domain',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result, queryClient } = renderHookWithQueryClient(
                () => useOptOutAiAgentTrialUpgradeMutation(),
                { storeState: defaultState },
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHook(
                () =>
                    useOptOutAiAgentTrialUpgradeMutation({
                        onSuccess: onSuccessMock,
                    }),
                { storeState: defaultState },
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockOptOutAiAgentTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHook(
                () =>
                    useOptOutAiAgentTrialUpgradeMutation({
                        onError: onErrorMock,
                    }),
                { storeState: defaultState },
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })
    })

    describe('useGetTrials', () => {
        it('should call getTrials with correct parameters', async () => {
            const mockTrialsData = [
                {
                    shopType: 'shopify',
                    shopName: 'test-store-1',
                    type: 'ai-trial' as const,
                    trial: {
                        startDatetime: '2024-01-01',
                        endDatetime: '2024-02-01',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
                {
                    shopType: 'shopify',
                    shopName: 'test-store-2',
                    type: 'sales-assistant' as const,
                    trial: {
                        startDatetime: '2024-01-15',
                        endDatetime: '2024-02-15',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            ]
            mockGetTrials.mockResolvedValue(mockTrialsData)

            const { result } = renderHook(() => useGetTrials('test-domain'), {
                storeState: defaultState,
            })

            await result.current.refetch()

            expect(mockGetTrials).toHaveBeenCalledWith('test-domain')
        })

        it('should transform response trials correctly', async () => {
            const mockTrialsData = [
                {
                    shopType: 'shopify',
                    shopName: 'test-store-1',
                    type: 'ai-trial' as const,
                    trial: {
                        startDatetime: '2024-01-01',
                        endDatetime: '2024-02-01',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
                {
                    shopType: 'shopify',
                    shopName: 'test-store-2',
                    type: 'sales-assistant' as const,
                    trial: {
                        startDatetime: '2024-01-15',
                        endDatetime: '2024-02-15',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            ]
            mockGetTrials.mockResolvedValue(mockTrialsData)

            const { result } = renderHook(
                () => useGetTrials('test-domain', { enabled: true }),
                { storeState: defaultState },
            )

            await waitFor(() => {
                expect(result.current.data).toBeDefined()
            })

            expect(result.current.data).toEqual([
                {
                    shopType: 'shopify',
                    shopName: 'test-store-1',
                    type: 'aiAgent',
                    trial: {
                        startDatetime: '2024-01-01',
                        endDatetime: '2024-02-01',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
                {
                    shopType: 'shopify',
                    shopName: 'test-store-2',
                    type: 'shoppingAssistant',
                    trial: {
                        startDatetime: '2024-01-15',
                        endDatetime: '2024-02-15',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            ])
        })

        it('should use correct query key', () => {
            const expectedQueryKey = trialsKeys.list('test-domain')

            expect(expectedQueryKey).toEqual(['aiAgentTrials', 'test-domain'])
        })

        it('should be enabled when gorgiasDomain is provided', () => {
            const { result } = renderHook(() => useGetTrials('test-domain'), {
                storeState: defaultState,
            })

            expect(result.current.isStale).toBe(true)
        })

        it('should be disabled when gorgiasDomain is empty', () => {
            const { result } = renderHook(() => useGetTrials(''), {
                storeState: defaultState,
            })

            expect(result.current.fetchStatus).toBe('idle')
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            const mockTrialsData = [
                {
                    shopType: 'shopify',
                    shopName: 'test-store',
                    type: 'ai-trial' as const,
                    trial: {
                        startDatetime: '2024-01-01',
                        endDatetime: '2024-02-01',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            ]
            mockGetTrials.mockResolvedValue(mockTrialsData)

            renderHook(
                () =>
                    useGetTrials('test-domain', {
                        onSuccess: onSuccessMock,
                        enabled: true,
                    }),
                { storeState: defaultState },
            )

            await waitFor(() => {
                expect(onSuccessMock).toHaveBeenCalled()
            })

            expect(onSuccessMock).toHaveBeenCalledWith([
                {
                    shopType: 'shopify',
                    shopName: 'test-store',
                    type: 'aiAgent',
                    trial: {
                        startDatetime: '2024-01-01',
                        endDatetime: '2024-02-01',
                        account: {
                            optInDatetime: null,
                            optOutDatetime: null,
                            plannedUpgradeDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                },
            ])
        })

        it('should handle error correctly', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockGetTrials.mockRejectedValue(mockError)

            renderHook(
                () =>
                    useGetTrials('test-domain', {
                        onError: onErrorMock,
                        enabled: true,
                        retry: false,
                    }),
                { storeState: defaultState },
            )

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalled()
            })

            expect(onErrorMock).toHaveBeenCalledWith(mockError)
        })

        it('should return empty array on 404 error', async () => {
            const axiosError = new AxiosError('Not Found')
            axiosError.response = {
                status: 404,
                statusText: 'Not Found',
                data: {},
                headers: {},
                config: {
                    headers: {} as any,
                },
            }
            mockGetTrials.mockRejectedValue(axiosError)

            const { result } = renderHook(
                () =>
                    useGetTrials('test-domain', {
                        enabled: true,
                        retry: false,
                    }),
                { storeState: defaultState },
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.data).toEqual([])
        })
        it('should respect enabled override', () => {
            const { result } = renderHook(
                () =>
                    useGetTrials('test-domain', {
                        enabled: false,
                    }),
                { storeState: defaultState },
            )

            expect(result.current.fetchStatus).toBe('idle')
        })
    })
})
