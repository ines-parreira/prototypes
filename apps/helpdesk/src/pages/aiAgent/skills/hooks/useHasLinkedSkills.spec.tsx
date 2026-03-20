import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useListIntents } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useHasLinkedSkills } from './useHasLinkedSkills'

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: jest.fn(),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

describe('useHasLinkedSkills', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockUseAiAgentStoreConfigurationContext =
        useAiAgentStoreConfigurationContext as jest.Mock
    const mockUseListIntents = useListIntents as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return hasLinkedSkills as true when there are linked intents', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: 'linked',
                        help_center_id: 123,
                        articles: [{ id: 1, title: 'Test Article' }],
                    },
                    {
                        name: 'order::cancel',
                        status: 'not_linked',
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasLinkedSkills).toBe(true)
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return hasLinkedSkills as false when all intents are not_linked or handover', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        status: 'not_linked',
                        help_center_id: 123,
                        articles: [],
                    },
                    {
                        name: 'order::cancel',
                        status: 'handover',
                        help_center_id: 123,
                        articles: [],
                    },
                ],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasLinkedSkills).toBe(false)
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should return hasLinkedSkills as false when intents array is empty', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: {
                intents: [],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasLinkedSkills).toBe(false)
        })
    })

    it('should return hasLinkedSkills as false when data is null', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasLinkedSkills).toBe(false)
        })
    })

    it('should handle loading state from store configuration', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: true,
            storeConfiguration: null,
        })

        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.hasLinkedSkills).toBe(false)
    })

    it('should handle loading state from intents query', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.hasLinkedSkills).toBe(false)
    })

    it('should not call useListIntents when help center ID is not available', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: null,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(mockUseListIntents).toHaveBeenCalledWith(0, {
            enabled: false,
        })
    })

    it('should handle error state from intents query', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseListIntents.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isError).toBe(true)
        expect(result.current.hasLinkedSkills).toBe(false)
    })
})
