import {renderHook} from '@testing-library/react-hooks'
import {chain} from 'lodash'
import {assumeMock} from 'utils/testing'
import {useGetArticleTemplates} from 'pages/settings/helpCenter/queries'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {
    ArticleTemplatesGroupedByCategoryFixture,
    ArticleTemplatesListFixture,
    ArticlesListFixture,
} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import {useGetHelpCenterArticles} from '../useGetHelpCenterArticles'
import {findArticleByKey} from '../../HelpCenterCreationWizardUtils'

jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/helpCenter/queries')

const mockedUseGetArticleTemplates = assumeMock(useGetArticleTemplates)
const mockedUseGetHelpCenterArticleList = assumeMock(
    useGetHelpCenterArticleList
)

describe('useGetHelpCenterArticles', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetArticleTemplates.mockImplementation(() => {
            return {
                data: ArticleTemplatesListFixture,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetArticleTemplates>
        })
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {data: []},
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })
    })
    it('should return template articles grouped by category when no articles created', () => {
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(mockedUseGetArticleTemplates).toHaveBeenCalled()
        expect(mockedUseGetHelpCenterArticleList).toHaveBeenCalled()

        expect(result.current.articles).toMatchObject(
            ArticleTemplatesGroupedByCategoryFixture
        )
        expect(result.current.isLoading).toBeFalsy()
    })

    it('should return default article group when there are no articles', () => {
        mockedUseGetArticleTemplates.mockImplementation(() => {
            return {
                data: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetArticleTemplates>
        })
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(result.current.articles).toMatchObject({})
    })

    it('should select the first template article by default when no articles created', () => {
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))
        const resultArray = chain(result.current.articles)
            .values()
            .flatten()
            .value()
        expect(resultArray[0].isSelected).toBeTruthy()
    })

    it('should return article data when there are articles created based on a template', () => {
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {
                    data: ArticlesListFixture,
                },
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })

        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))
        const articleByKey = findArticleByKey(
            result.current.articles,
            'shippingPolicy'
        )
        expect(articleByKey).toMatchObject({
            id: 1,
            isSelected: true,
            title: 'Article 1',
            category: 'shippingAndDelivery',
        })
    })

    it('should return only articles created from a template and ignore the rest', () => {
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {
                    data: [
                        {
                            id: 1,
                            template_key: 'customTemplateKey',
                            translation: {
                                title: 'How do I make a return from my account?',
                                content: 'Updated content',
                                locale: 'en-US',
                            },
                            available_languages: ['en-US'],
                        },
                        {
                            id: 2,
                            translation: {
                                title: 'Custom article',
                                content: 'content for custom article',
                                locale: 'en-US',
                            },
                            available_languages: ['en-US'],
                        },
                    ],
                },
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })

        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(result.current.articles).toMatchObject(
            ArticleTemplatesGroupedByCategoryFixture
        )
        expect(result.current.isLoading).toBeFalsy()
    })
})
