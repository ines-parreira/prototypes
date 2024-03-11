import {renderHook, act} from '@testing-library/react-hooks'
import {assumeMock} from 'utils/testing'
import {useGetAIArticlesByHelpCenter} from 'pages/settings/helpCenter/queries'
import {
    AIArticlesListFixture,
    AILibraryArticleItemsFixture,
} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {AIArticleToggleOptionValue} from 'models/helpCenter/types'
import {useHelpCenterAIArticlesLibrary} from '../useHelpCenterAIArticlesLibrary'

jest.mock('pages/settings/helpCenter/queries')

const mockedUseGetAIArticlesByHelpCenter = assumeMock(
    useGetAIArticlesByHelpCenter
)

describe('useGetAIArticlesByHelpCenter', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetAIArticlesByHelpCenter.mockImplementation(() => {
            return {
                data: AIArticlesListFixture,
                isInitialLoading: false,
            } as unknown as ReturnType<typeof useGetAIArticlesByHelpCenter>
        })
    })

    it('should return the new AI articles with the correct counters', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US')
        )

        expect(mockedUseGetAIArticlesByHelpCenter).toHaveBeenCalled()

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
            useHelpCenterAIArticlesLibrary(1, 'en-US')
        )

        // we have new articles, but we didn't generated at least 5 articles
        expect(result.current.hasNewArticles).toBe(false)
    })

    it('should select the first article by default', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US')
        )

        expect(result.current.selectedArticle).toEqual(
            AILibraryArticleItemsFixture[0]
        )
    })

    it('should handle the selection of an article', () => {
        const {result} = renderHook(() =>
            useHelpCenterAIArticlesLibrary(1, 'en-US')
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
            useHelpCenterAIArticlesLibrary(1, 'en-US')
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
})
