import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'

import { useGuidanceCount } from './useGuidanceCount'

jest.mock('pages/aiAgent/hooks/useGuidanceAiSuggestions')

const mockUseGuidanceAiSuggestions =
    useGuidanceAiSuggestions as jest.MockedFunction<
        typeof useGuidanceAiSuggestions
    >

const mockStore = configureStore([])

const createMockGuidanceArticles = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: `Article ${i + 1}`,
        visibility: 'PUBLIC' as const,
    }))

describe('useGuidanceCount', () => {
    let queryClient: QueryClient
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        store = mockStore({})
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    it('should return guidance count and loading state', () => {
        const mockGuidanceArticles = createMockGuidanceArticles(42)
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: mockGuidanceArticles,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: mockGuidanceArticles,
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: true,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 123,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(42)
        expect(result.current.isLoading).toBe(false)
    })

    it('should call useGuidanceAiSuggestions with correct parameters', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: true,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const helpCenterId = 456
        const shopName = 'test'

        renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: helpCenterId,
                    shopName: shopName,
                }),
            { wrapper },
        )

        expect(mockUseGuidanceAiSuggestions).toHaveBeenCalledWith({
            helpCenterId: helpCenterId,
            shopName: shopName,
            query: '',
        })
    })

    it('should return 0 when guidanceUsed is undefined', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: undefined,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 789,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should return 0 when guidanceUsed is empty', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 111,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle loading state correctly', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: true,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 222,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should handle error state gracefully', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 333,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle large item counts', () => {
        const mockGuidanceArticles = createMockGuidanceArticles(9999)
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: mockGuidanceArticles,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: mockGuidanceArticles,
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: true,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 444,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(9999)
        expect(result.current.isLoading).toBe(false)
    })

    it('should update when data changes', async () => {
        const initialArticles = createMockGuidanceArticles(5)
        const updatedArticles = createMockGuidanceArticles(10)

        mockUseGuidanceAiSuggestions.mockReturnValueOnce({
            guidanceUsed: initialArticles,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: initialArticles,
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: true,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result, rerender } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 555,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(5)

        mockUseGuidanceAiSuggestions.mockReturnValueOnce({
            guidanceUsed: updatedArticles,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: updatedArticles,
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: true,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        rerender()

        await waitFor(() => {
            expect(result.current.guidanceCount).toBe(10)
        })
    })

    it('should pass empty query string to useGuidanceAiSuggestions', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 666,
                    shopName: 'test',
                }),
            {
                wrapper,
            },
        )

        const lastCallArgs = mockUseGuidanceAiSuggestions.mock.calls[0][0]

        expect(lastCallArgs.query).toBe('')
    })

    it('should handle zero item count', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: true,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 777,
                    shopName: 'test',
                }),
            { wrapper },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })

    it('should correctly count only PUBLIC visibility articles', () => {
        const mixedArticles = [
            { id: 1, title: 'Article 1', visibility: 'PUBLIC' as const },
            { id: 2, title: 'Article 2', visibility: 'PRIVATE' as const },
            { id: 3, title: 'Article 3', visibility: 'PUBLIC' as const },
            { id: 4, title: 'Article 4', visibility: 'PUBLIC' as const },
        ]
        const publicArticles = mixedArticles.filter(
            (a) => a.visibility === 'PUBLIC',
        )

        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: publicArticles,
            isLoadingGuidanceArticleList: false,
            guidanceArticles: mixedArticles,
            isLoadingAiGuidances: false,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: true,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 888,
                    shopName: 'test',
                }),
            {
                wrapper,
            },
        )

        expect(result.current.guidanceCount).toBe(3)
    })

    it('should handle mixed loading states correctly', () => {
        mockUseGuidanceAiSuggestions.mockReturnValue({
            guidanceUsed: [],
            isLoadingGuidanceArticleList: false,
            guidanceArticles: [],
            isLoadingAiGuidances: true,
            guidanceAISuggestions: [],
            isAllAIGuidancesUsed: false,
            isEmptyStateNoAIGuidances: false,
            isEmptyStateAIGuidances: false,
            isGuidancesOnly: false,
            isGuidancesAndAIGuidances: false,
            invalidateAiGuidances: jest.fn(),
        } as any)

        const { result } = renderHook(
            () =>
                useGuidanceCount({
                    guidanceHelpCenterId: 999,
                    shopName: 'test',
                }),
            {
                wrapper,
            },
        )

        expect(result.current.guidanceCount).toBe(0)
        expect(result.current.isLoading).toBe(false)
    })
})
