import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState } from 'state/types'

import { useKnowledgeHubArticles } from './useKnowledgeHubArticles'

jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles')

const mockUseGetKnowledgeHubArticles = jest.requireMock(
    'models/helpCenter/queries',
).useGetKnowledgeHubArticles as jest.Mock
const mockUseAiAgentStoreConfigurationContext = jest.requireMock(
    'pages/aiAgent/providers/AiAgentStoreConfigurationContext',
).useAiAgentStoreConfigurationContext as jest.Mock
const mockTransformKnowledgeHubArticlesToKnowledgeItems = jest.requireMock(
    'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles',
).transformKnowledgeHubArticlesToKnowledgeItems as jest.Mock

describe('useKnowledgeHubArticles', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS({ id: 123 }),
    } as RootState)

    const mockRefetch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 1,
                snippetHelpCenterId: 2,
                helpCenterId: 3,
            },
            isLoading: false,
        })

        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: [] },
            isInitialLoading: false,
            refetch: mockRefetch,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockReturnValue([])
    })

    it('returns table data, loading state, and help center IDs', () => {
        const { result } = renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.tableData).toEqual([])
        expect(result.current.isInitialLoading).toBe(false)
        expect(result.current.hasWebsiteSync).toBe(false)
        expect(result.current.faqHelpCenterId).toBe(3)
        expect(result.current.snippetHelpCenterId).toBe(2)
        expect(result.current.refetchKnowledgeHubArticles).toBe(mockRefetch)
    })

    it('transforms articles data correctly', () => {
        const mockArticles = [
            { id: 1, title: 'Article 1', type: 'faq' },
            { id: 2, title: 'Article 2', type: 'guidance' },
        ]
        const mockTransformedData = [
            { id: 1, title: 'Article 1', type: 'faq' },
            { id: 2, title: 'Article 2', type: 'guidance' },
        ]

        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: mockArticles },
            isInitialLoading: false,
            refetch: mockRefetch,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockReturnValue(
            mockTransformedData,
        )

        const { result } = renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(
            mockTransformKnowledgeHubArticlesToKnowledgeItems,
        ).toHaveBeenCalledWith(mockArticles)
        expect(result.current.tableData).toEqual(mockTransformedData)
    })

    it('detects website sync when domain type exists in table data', () => {
        const mockTransformedData = [
            { id: 1, title: 'Website', type: 'domain' },
            { id: 2, title: 'Article', type: 'faq' },
        ]

        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: [] },
            isInitialLoading: false,
            refetch: mockRefetch,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockReturnValue(
            mockTransformedData,
        )

        const { result } = renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.hasWebsiteSync).toBe(true)
    })

    it('handles loading state correctly', () => {
        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: undefined,
            isInitialLoading: true,
            refetch: mockRefetch,
        })

        const { result } = renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.isInitialLoading).toBe(true)
        expect(result.current.tableData).toEqual([])
    })

    it('disables query when store configuration is loading', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('returns undefined help center IDs when store configuration is null', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: null,
            isLoading: false,
        })

        const { result } = renderHook(() => useKnowledgeHubArticles(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.faqHelpCenterId).toBeUndefined()
        expect(result.current.snippetHelpCenterId).toBeUndefined()
    })
})
