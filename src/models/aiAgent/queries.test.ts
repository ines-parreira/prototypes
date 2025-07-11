import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import {
    storeConfigurationKeys,
    useUpgradeSalesSubscriptionMutation,
} from './queries'
import { upgradeSalesSubscription } from './resources/configuration'

jest.mock('./resources/configuration', () => ({
    upgradeSalesSubscription: jest.fn(),
}))

const mockStore = configureStore([])

describe('useUpgradeSalesSubscriptionMutation', () => {
    let queryClient: QueryClient
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        store = mockStore({
            currentAccount: fromJS({
                domain: 'test-domain',
            }),
        })

        jest.clearAllMocks()
    })

    it('should call upgradeSalesSubscription with the correct domain', async () => {
        const mockResponse = { success: true, planLevel: 6 }
        jest.mocked(upgradeSalesSubscription).mockResolvedValue(mockResponse)

        const { result } = renderHook(
            () => useUpgradeSalesSubscriptionMutation(),
            {
                wrapper: ({ children }) =>
                    createElement(
                        Provider,
                        { store },
                        createElement(
                            QueryClientProvider,
                            { client: queryClient },
                            children,
                        ),
                    ),
            },
        )

        result.current.mutate([])

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(upgradeSalesSubscription).toHaveBeenCalledWith('test-domain')
        expect(upgradeSalesSubscription).toHaveBeenCalledTimes(1)
    })

    it('should invalidate store configuration queries on success', async () => {
        const mockResponse = { success: true, planLevel: 6 }
        jest.mocked(upgradeSalesSubscription).mockResolvedValue(mockResponse)

        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(
            () => useUpgradeSalesSubscriptionMutation(),
            {
                wrapper: ({ children }) =>
                    createElement(
                        Provider,
                        { store },
                        createElement(
                            QueryClientProvider,
                            { client: queryClient },
                            children,
                        ),
                    ),
            },
        )

        result.current.mutate([])

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: storeConfigurationKeys.all(),
        })
    })

    it('should handle errors correctly', async () => {
        const mockError = new Error('Upgrade failed')
        jest.mocked(upgradeSalesSubscription).mockRejectedValue(mockError)

        const { result } = renderHook(
            () => useUpgradeSalesSubscriptionMutation(),
            {
                wrapper: ({ children }) =>
                    createElement(
                        Provider,
                        { store },
                        createElement(
                            QueryClientProvider,
                            { client: queryClient },
                            children,
                        ),
                    ),
            },
        )

        result.current.mutate([])

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toEqual(mockError)
    })

    it('should accept and use override options', async () => {
        const mockResponse = { success: true, planLevel: 6 }
        jest.mocked(upgradeSalesSubscription).mockResolvedValue(mockResponse)

        const onSuccessMock = jest.fn()
        const onErrorMock = jest.fn()

        const { result } = renderHook(
            () =>
                useUpgradeSalesSubscriptionMutation({
                    onSuccess: onSuccessMock,
                    onError: onErrorMock,
                }),
            {
                wrapper: ({ children }) =>
                    createElement(
                        Provider,
                        { store },
                        createElement(
                            QueryClientProvider,
                            { client: queryClient },
                            children,
                        ),
                    ),
            },
        )

        result.current.mutate([])

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(onSuccessMock).toHaveBeenCalledWith(mockResponse, [], undefined)
        expect(onErrorMock).not.toHaveBeenCalled()
    })
})
