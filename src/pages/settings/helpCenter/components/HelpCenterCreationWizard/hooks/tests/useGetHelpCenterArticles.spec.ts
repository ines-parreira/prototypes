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
import {
    AIArticlesGroupedFixture,
    AIArticlesListFixture,
} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import {useGetHelpCenterArticles} from '../useGetHelpCenterArticles'
import {findArticleByKey} from '../../HelpCenterCreationWizardUtils'

jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/helpCenter/queries')
jest.mock('pages/settings/helpCenter/hooks/useConditionalGetAIArticles')
jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration')
jest.mock('pages/automate/common/hooks/useShopifyIntegrations')

const mockedUseGetArticleTemplates = assumeMock(useGetArticleTemplates)
const mockedUseGetHelpCenterArticleList = assumeMock(
    useGetHelpCenterArticleList
)
const mockedUseConditionalGetAIArticles = assumeMock(
    useConditionalGetAIArticles
)
const mockedUseSelfServiceStoreIntegration = assumeMock(
    useSelfServiceStoreIntegration
)
const mockedUseShopifyIntegrations = assumeMock(useShopifyIntegrations)

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
        mockedUseSelfServiceStoreIntegration.mockImplementation(() => {
            return {
                id: 1,
                name: 'My Shop',
            } as unknown as ReturnType<typeof useSelfServiceStoreIntegration>
        })
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}, {id: 2}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )
    })

    describe('article templates', () => {
        beforeEach(() => {
            mockedUseConditionalGetAIArticles.mockImplementation(() => {
                return {
                    fetchedArticles: [],
                    isLoading: false,
                } as unknown as ReturnType<typeof useConditionalGetAIArticles>
            })
        })
        it('should return template articles grouped by category when no articles created', () => {
            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )

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
            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )

            expect(result.current.articles).toMatchObject({})
        })

        it('should select the first template article by default when no articles created', () => {
            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )
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

            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )
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

            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )

            expect(result.current.articles).toMatchObject(
                ArticleTemplatesGroupedByCategoryFixture
            )
            expect(result.current.isLoading).toBeFalsy()
        })
    })

    describe('ai articles', () => {
        beforeEach(() => {
            mockedUseConditionalGetAIArticles.mockImplementation(() => {
                return {
                    fetchedArticles: AIArticlesListFixture,
                    isLoading: false,
                } as unknown as ReturnType<typeof useConditionalGetAIArticles>
            })
        })

        it('should return ai articles', () => {
            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop')
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.articles).toMatchObject(
                AIArticlesGroupedFixture
            )
        })

        it('should return ai articles when a single store account does not have store connection', () => {
            mockedUseShopifyIntegrations.mockImplementation(
                () =>
                    [{id: 1}] as unknown as ReturnType<
                        typeof useShopifyIntegrations
                    >
            )

            const {result} = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', null)
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.hasAiArticles).toBe(true)
            expect(result.current.articles).toMatchObject(
                AIArticlesGroupedFixture
            )
        })
        it('should return empty array of articles when multi-store does not have store connection', () => {
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
                useGetHelpCenterArticles(1, 'en-US', null)
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.hasAiArticles).toBe(false)
        })
    })
})
