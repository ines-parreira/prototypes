import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { useHasLinkedSkills } from './useHasLinkedSkills'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticleList: jest.fn(),
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
    const mockUseGetHelpCenterArticleList =
        useGetHelpCenterArticleList as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should return hasSkills as true when there are skill articles', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [{ id: 1, title: 'Test Skill' }],
            },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasSkills).toBe(true)
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return hasSkills as false when articles array is empty', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasSkills).toBe(false)
        })
    })

    it('should return hasSkills as false when data is null', async () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        await waitFor(() => {
            expect(result.current.hasSkills).toBe(false)
        })
    })

    it('should handle loading state from store configuration', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: true,
            storeConfiguration: null,
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.hasSkills).toBe(false)
    })

    it('should handle loading state from articles query', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.hasSkills).toBe(false)
    })

    it('should disable query when help center ID is not available', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: null,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            0,
            { origin: 'skill', per_page: 1 },
            { enabled: false },
        )
    })

    it('should handle error state', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useHasLinkedSkills(), { wrapper })

        expect(result.current.isError).toBe(true)
        expect(result.current.hasSkills).toBe(false)
    })
})
