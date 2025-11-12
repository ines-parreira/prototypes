import { renderHook } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'

import { KnowledgeVisibility } from './types'
import { useKnowledgeHub } from './useKnowledgeHub'
import { transformKnowledgeHubArticlesToKnowledgeItems } from './utils/transformKnowledgeHubArticles'

jest.mock('hooks/useAppSelector')
jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('./utils/transformKnowledgeHubArticles')

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGetKnowledgeHubArticles = useGetKnowledgeHubArticles as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock
const mockTransformKnowledgeHubArticlesToKnowledgeItems =
    transformKnowledgeHubArticlesToKnowledgeItems as jest.Mock

describe('useKnowledgeHub', () => {
    const mockShopifyIntegrations = [
        {
            id: 1,
            name: 'Store Alpha',
            type: 'shopify',
            meta: { shop_name: 'store-alpha' },
        },
        {
            id: 2,
            name: 'Store Beta',
            type: 'shopify',
            meta: { shop_name: 'store-beta' },
        },
    ]

    const originalLocation = window.location

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        window.location = { href: 'http://localhost/app' } as Location

        mockUseAppSelector
            .mockReturnValueOnce(123) // getCurrentAccountId
            .mockReturnValueOnce(mockShopifyIntegrations) // getShopifyIntegrationsSortedByName

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
        })

        mockExtractShopNameFromUrl.mockReturnValue(undefined)

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockImplementation(
            (articles) => {
                return articles.map((article: any) => ({
                    id: article.id,
                    title: article.title,
                    type: article.type,
                    lastUpdatedAt: article.last_updated_at,
                    inUseByAI:
                        article.visibility === 'public'
                            ? KnowledgeVisibility.PUBLIC
                            : KnowledgeVisibility.UNLISTED,
                    source: article.source,
                }))
            },
        )
    })

    afterEach(() => {
        window.location = originalLocation
    })

    describe('shopName resolution', () => {
        it('returns shop name from URL when available', () => {
            mockExtractShopNameFromUrl.mockReturnValue('my-shop-from-url')

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.shopName).toBe('my-shop-from-url')
        })

        it('returns first Shopify integration shop name when URL extraction returns undefined', () => {
            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.shopName).toBe('store-alpha')
        })

        it('returns undefined when no URL extraction and no integrations', () => {
            mockUseAppSelector.mockReset()
            mockUseAppSelector
                .mockReturnValueOnce(123) // getCurrentAccountId
                .mockReturnValueOnce([]) // getShopifyIntegrationsSortedByName (empty)

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.shopName).toBeUndefined()
        })

        it('prefers URL shop name over first integration when both exist', () => {
            mockExtractShopNameFromUrl.mockReturnValue('url-shop')

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.shopName).toBe('url-shop')
        })
    })

    describe('data fetching', () => {
        it('fetches articles with correct parameters', () => {
            renderHook(() => useKnowledgeHub())

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                {
                    account_id: 123,
                    guidance_help_center_id: 1,
                    snippet_help_center_id: 2,
                    faq_help_center_id: 3,
                },
                {
                    enabled: true,
                },
            )
        })

        it('waits for store configuration before fetching', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: null,
                isLoading: true,
            })

            renderHook(() => useKnowledgeHub())

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                expect.anything(),
                {
                    enabled: false,
                },
            )
        })

        it('uses help center IDs from store configuration', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    guidanceHelpCenterId: 10,
                    snippetHelpCenterId: 20,
                    helpCenterId: 30,
                },
                isLoading: false,
            })

            renderHook(() => useKnowledgeHub())

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                {
                    account_id: 123,
                    guidance_help_center_id: 10,
                    snippet_help_center_id: 20,
                    faq_help_center_id: 30,
                },
                expect.anything(),
            )
        })
    })

    describe('tableData transformation', () => {
        it('returns empty array when no articles', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: { articles: [] },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.tableData).toEqual([])
        })

        it('returns empty array when data is undefined', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.tableData).toEqual([])
        })

        it('transforms articles to knowledge items', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Article',
                            type: 'guidance',
                            last_updated_at: '2024-01-15T10:00:00Z',
                            visibility: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.tableData).toHaveLength(1)
            expect(result.current.tableData[0]).toMatchObject({
                id: '1',
                title: 'Test Article',
                type: 'guidance',
            })
        })
    })

    describe('hasWebsiteSync', () => {
        it('returns false when no domain items exist', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Article',
                            type: 'guidance',
                            last_updated_at: '2024-01-15T10:00:00Z',
                            visibility: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.hasWebsiteSync).toBe(false)
        })

        it('returns true when domain item exists', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Domain',
                            type: 'domain',
                            last_updated_at: '2024-01-15T10:00:00Z',
                            visibility: 'public',
                            source: 'example.com',
                        },
                    ],
                },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.hasWebsiteSync).toBe(true)
        })

        it('returns false when tableData is empty', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: { articles: [] },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.hasWebsiteSync).toBe(false)
        })
    })

    describe('isInitialLoading', () => {
        it('returns loading state from query', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.isInitialLoading).toBe(true)
        })

        it('returns false when not loading', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: { articles: [] },
                isInitialLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.isInitialLoading).toBe(false)
        })
    })

    describe('faqHelpCenterId', () => {
        it('returns faqHelpCenterId from store configuration', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    guidanceHelpCenterId: 1,
                    snippetHelpCenterId: 2,
                    helpCenterId: 42,
                },
                isLoading: false,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.faqHelpCenterId).toBe(42)
        })

        it('returns undefined when store configuration is not loaded', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: null,
                isLoading: true,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.faqHelpCenterId).toBeUndefined()
        })
    })

    describe('integration with selectors', () => {
        it('calls getCurrentAccountId selector', () => {
            renderHook(() => useKnowledgeHub())

            expect(mockUseAppSelector).toHaveBeenCalled()
        })

        it('calls getShopifyIntegrationsSortedByName selector', () => {
            renderHook(() => useKnowledgeHub())

            expect(mockUseAppSelector).toHaveBeenCalled()
        })

        it('calls extractShopNameFromUrl with current window location', () => {
            renderHook(() => useKnowledgeHub())

            expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
                window.location.href,
            )
        })
    })
})
