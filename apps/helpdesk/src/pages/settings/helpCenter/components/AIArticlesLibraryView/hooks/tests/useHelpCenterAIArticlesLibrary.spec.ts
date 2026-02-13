import { assumeMock, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { AIArticleToggleOptionValue } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import { useListStoreMappings } from 'models/storeMapping/queries'
import {
    AIArticlesListFixture,
    AILibraryArticleItemsFixture,
} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import type { StoreState } from 'state/types'

import { useHelpCenterAIArticlesLibrary } from '../useHelpCenterAIArticlesLibrary'

jest.mock('pages/settings/helpCenter/hooks/useGetAIArticles')
jest.mock('models/storeMapping/queries')
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useShopifyIntegrations')

const mockedUseConditionalGetAIArticles = assumeMock(useGetAIArticles)
const mockedUseListStoreMappings = assumeMock(useListStoreMappings)
const mockedUseAppSelector = assumeMock(useAppSelector)

describe('useHelpCenterAIArticlesLibrary', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseConditionalGetAIArticles.mockImplementation(() => {
            return {
                fetchedArticles: AIArticlesListFixture,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetAIArticles>
        })
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{ store_id: 1 }, { store_id: 2 }],
                }) as unknown as ReturnType<typeof useListStoreMappings>,
        )
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'My Shop',
                        },
                    ],
                }),
            } as unknown as StoreState),
        )
    })

    it('should return the new AI articles with the correct counters', () => {
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()

        expect(result.current.articles).toEqual(
            AILibraryArticleItemsFixture.filter((aiArticle) => aiArticle.isNew),
        )
        expect(result.current.isLoading).toBe(false)

        expect(result.current.counters).toEqual({
            new: 2,
            old: 1,
            all: 3,
        })
    })

    it('should return that it has new articles', () => {
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(result.current.hasNewArticles).toBe(true)
    })

    it('should select the first article by default', () => {
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(result.current.selectedArticle).toEqual(
            AILibraryArticleItemsFixture[0],
        )
    })

    it('should handle the selection of an article', () => {
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        act(() => {
            result.current.setSelectedArticle(AILibraryArticleItemsFixture[1])
        })

        expect(result.current.selectedArticle).toEqual(
            AILibraryArticleItemsFixture[1],
        )
    })

    it('should handle the selection of an article type', async () => {
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        act(() => {
            result.current.setSelectedArticleType(
                AIArticleToggleOptionValue.Old,
            )
        })

        expect(result.current.selectedArticleType).toBe(
            AIArticleToggleOptionValue.Old,
        )

        await waitFor(() => {
            expect(result.current.articles).toEqual(
                AILibraryArticleItemsFixture.filter(
                    (aiArticle) => !aiArticle.isNew,
                ),
            )
        })
    })

    it('should return false when there is no email-to-store connection for single-store', () => {
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{ store_id: 3 }],
                }) as unknown as ReturnType<typeof useListStoreMappings>,
        )
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(result.current.showLinkToConnectEmailToStore).toBe(false)
    })

    it('should return true when there is no email-to-store connection for multi-stores', () => {
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{ store_id: 3 }],
                }) as unknown as ReturnType<typeof useListStoreMappings>,
        )
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'My Shop',
                        },
                        {
                            id: 2,
                            type: IntegrationType.Magento2,
                            name: 'Shop X',
                        },
                    ],
                }),
            } as unknown as StoreState),
        )
        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(result.current.hasStoreConnectionOrDefaultStore).toBe(true)
        expect(result.current.showLinkToConnectEmailToStore).toBe(true)
    })

    it('should return empty array of articles when multi-store does not have store connection', () => {
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'My Shop',
                        },
                        {
                            id: 2,
                            type: IntegrationType.Magento2,
                            name: 'Shop X',
                        },
                    ],
                }),
            } as unknown as StoreState),
        )
        mockedUseConditionalGetAIArticles.mockImplementation(() => {
            return {
                fetchedArticles: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetAIArticles>
        })

        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', null),
        )

        expect(result.current.hasStoreConnectionOrDefaultStore).toBe(false)
        expect(result.current.showLinkToConnectEmailToStore).toBe(true)
        expect(result.current.articles).toEqual([])
    })

    it('should include article that has been dismissed in Top Questions section in the new AI articles', () => {
        mockedUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: [
                ...AIArticlesListFixture,
                {
                    key: 'ai_Generated_4',
                    title: 'How to cancel order',
                    html_content: '<h1>How to cancel order</h1>',
                    score: 0,
                    category: 'Ordering',
                    excerpt:
                        'You will have the option to cancel your order within your confirmation email. You may also contact our customer service team at [email/phone #]...',
                    batch_datetime: '1709110371700',
                    review_action: 'dismissFromTopQuestions',
                },
            ],
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop'),
        )

        expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()

        expect(result.current.articles).toEqual(
            AILibraryArticleItemsFixture.filter((aiArticle) => aiArticle.isNew),
        )
        expect(result.current.isLoading).toBe(false)

        expect(result.current.counters).toEqual({
            new: 2,
            old: 2,
            all: 4,
        })
    })
})
