import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

import useAppSelector from 'hooks/useAppSelector'
import { accountConfigurationKeys } from 'models/aiAgent/queries'
import { apiClient } from 'models/aiAgent/resources/configuration'

import { useUpdateAiAutofill } from '../useUpdateAiAutofill'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgent/resources/configuration', () => ({
    apiClient: {
        post: jest.fn(),
    },
}))

const useAppSelectorMock = assumeMock(useAppSelector)
const apiClientPostMock = assumeMock(apiClient.post)

describe('useUpdateAiAutofill', () => {
    const accountDomain = 'test-account'
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        useAppSelectorMock.mockReturnValue({
            get: jest.fn((key: string) => {
                if (key === 'domain') return accountDomain
                return null
            }),
        } as any)

        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should call POST endpoint with correct params and invalidate query on success', async () => {
        const mockResponse = { data: { success: true } }
        apiClientPostMock.mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useUpdateAiAutofill(), { wrapper })

        // Spy on invalidateQueries
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        // Call mutation
        await result.current.mutateAsync({
            customFieldId: 123,
            enabled: true,
        })

        // Should call correct endpoint
        expect(apiClientPostMock).toHaveBeenCalledTimes(1)
        expect(apiClientPostMock).toHaveBeenCalledWith(
            `/config/accounts/${accountDomain}/custom-fields/123`,
            { enabled: true },
        )

        // Should invalidate account configuration query
        await waitFor(() => {
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: accountConfigurationKeys.detail(accountDomain),
            })
        })
    })

    it('should handle errors correctly', async () => {
        const mockError = new AxiosError('Network error')
        apiClientPostMock.mockRejectedValue(mockError)

        const { result } = renderHook(() => useUpdateAiAutofill(), { wrapper })

        await expect(
            result.current.mutateAsync({
                customFieldId: 123,
                enabled: false,
            }),
        ).rejects.toThrow('Network error')

        // Should have called endpoint
        expect(apiClientPostMock).toHaveBeenCalledTimes(1)
    })
})
