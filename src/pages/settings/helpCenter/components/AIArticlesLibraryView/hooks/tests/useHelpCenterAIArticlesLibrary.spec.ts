import {renderHook, act} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AIArticlesListFixture,
    AILibraryArticleItemsFixture,
} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {AIArticleToggleOptionValue} from 'models/helpCenter/types'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {useListStoreMappings} from 'models/storeMapping/queries'
import useAppSelector from 'hooks/useAppSelector'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import {useHelpCenterAIArticlesLibrary} from '../useHelpCenterAIArticlesLibrary'

jest.mock('pages/settings/helpCenter/hooks/useConditionalGetAIArticles')
jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration')
jest.mock('models/storeMapping/queries')
jest.mock('hooks/useAppSelector')
jest.mock('pages/automate/common/hooks/useShopifyIntegrations')

const mockedUseConditionalGetAIArticles = assumeMock(
    useConditionalGetAIArticles
)
const mockedUseSelfServiceStoreIntegration = assumeMock(
    useSelfServiceStoreIntegration
)
const mockedUseListStoreMappings = assumeMock(useListStoreMappings)
const mockedUseAppSelector = assumeMock(useAppSelector)
const mockedUseShopifyIntegrations = assumeMock(useShopifyIntegrations)

describe('useHelpCenterAIArticlesLibrary', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseConditionalGetAIArticles.mockImplementation(() => {
            return {
                fetchedArticles: AIArticlesListFixture,
                isLoading: false,
            } as unknown as ReturnType<typeof useConditionalGetAIArticles>
        })
        mockedUseSelfServiceStoreIntegration.mockImplementation(() => {
            return {
                id: 1,
                name: 'My Shop',
            } as unknown as ReturnType<typeof useSelfServiceStoreIntegration>
        })
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{store_id: 1}, {store_id: 2}],
                } as unknown as ReturnType<typeof useListStoreMappings>)
        )
        mockedUseAppSelector.mockImplementation(() => [
            {id: 3, type: 'email'},
            {id: 4, type: 'email'},
        ])
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )
        mockFlags({
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                true,
        })
    })

    it('should return the new AI articles with the correct counters', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()

        expect(result.current.articles).toEqual(
            AILibraryArticleItemsFixture.filter((aiArticle) => aiArticle.isNew)
        )
        expect(result.current.isLoading).toBe(false)

        expect(result.current.counters).toEqual({
            new: 2,
            old: 1,
            all: 3,
        })
    })

    it("should return that it doesn't have any new articles", () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        // we have new articles, but we didn't generated at least 5 articles
        expect(result.current.hasNewArticles).toBe(false)
    })

    it('should select the first article by default', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        expect(result.current.selectedArticle).toEqual(
            AILibraryArticleItemsFixture[0]
        )
    })

    it('should handle the selection of an article', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        act(() => {
            result.current.setSelectedArticle(AILibraryArticleItemsFixture[1])
        })

        expect(result.current.selectedArticle).toEqual(
            AILibraryArticleItemsFixture[1]
        )
    })

    it('should handle the selection of an article type', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        act(() => {
            result.current.setSelectedArticleType(
                AIArticleToggleOptionValue.Old
            )
        })

        expect(result.current.selectedArticleType).toBe(
            AIArticleToggleOptionValue.Old
        )

        expect(result.current.articles).toEqual(
            AILibraryArticleItemsFixture.filter((aiArticle) => !aiArticle.isNew)
        )
    })

    it('should return false when there is no email-to-store connection for single-store', () => {
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{store_id: 3}],
                } as unknown as ReturnType<typeof useListStoreMappings>)
        )
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        expect(result.current.showLinkToConnectEmailToStore).toBe(false)
    })

    it('should return true when there is no email-to-store connection for multi-stores', () => {
        mockedUseListStoreMappings.mockImplementation(
            () =>
                ({
                    data: [{store_id: 3}],
                } as unknown as ReturnType<typeof useListStoreMappings>)
        )
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}, {id: 2}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        expect(result.current.hasStoreConnectionOrDefaultStore).toBe(true)
        expect(result.current.showLinkToConnectEmailToStore).toBe(true)
    })

    it('should return empty array of articles when multi-store does not have store connection', () => {
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}, {id: 2}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )
        mockedUseSelfServiceStoreIntegration.mockImplementation(() => {
            return undefined
        })
        mockedUseConditionalGetAIArticles.mockImplementation(() => {
            return {
                fetchedArticles: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useConditionalGetAIArticles>
        })

        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', null)
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

        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US', 'My Shop')
        )

        expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()

        expect(result.current.articles).toEqual(
            AILibraryArticleItemsFixture.filter((aiArticle) => aiArticle.isNew)
        )
        expect(result.current.isLoading).toBe(false)

        expect(result.current.counters).toEqual({
            new: 2,
            old: 2,
            all: 4,
        })
    })
})
