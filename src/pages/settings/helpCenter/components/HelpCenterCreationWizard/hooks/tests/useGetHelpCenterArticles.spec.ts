import { fromJS } from 'immutable'
import { chain } from 'lodash'

import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/constants'
import {
    AIArticlesGroupedFixture,
    AIArticlesListFixture,
} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {
    ArticlesListFixture,
    ArticleTemplatesGroupedByCategoryFixture,
    ArticleTemplatesListFixture,
} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import { useGetArticleTemplates } from 'pages/settings/helpCenter/queries'
import { StoreState } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { findArticleByKey } from '../../HelpCenterCreationWizardUtils'
import { useGetHelpCenterArticles } from '../useGetHelpCenterArticles'

jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/helpCenter/queries')
jest.mock('pages/settings/helpCenter/hooks/useGetAIArticles')
jest.mock('hooks/useAppSelector')

const mockedUseGetArticleTemplates = assumeMock(useGetArticleTemplates)
const mockedUseGetHelpCenterArticleList = assumeMock(
    useGetHelpCenterArticleList,
)
const mockedUseConditionalGetAIArticles = assumeMock(useGetAIArticles)
const mockedUseAppSelector = assumeMock(useAppSelector)

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
                data: { data: [] },
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })
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
    })

    describe('article templates', () => {
        beforeEach(() => {
            mockedUseConditionalGetAIArticles.mockImplementation(() => {
                return {
                    fetchedArticles: [],
                    isLoading: false,
                } as unknown as ReturnType<typeof useGetAIArticles>
            })
        })
        it('should return template articles grouped by category when no articles created', () => {
            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
            )

            expect(mockedUseGetArticleTemplates).toHaveBeenCalled()
            expect(mockedUseGetHelpCenterArticleList).toHaveBeenCalled()

            expect(result.current.articles).toMatchObject(
                ArticleTemplatesGroupedByCategoryFixture,
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
            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
            )

            expect(result.current.articles).toMatchObject({})
        })

        it('should select the first template article by default when no articles created', () => {
            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
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

            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
            )
            const articleByKey = findArticleByKey(
                result.current.articles,
                'shippingPolicy',
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

            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
            )

            expect(result.current.articles).toMatchObject(
                ArticleTemplatesGroupedByCategoryFixture,
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
                } as unknown as ReturnType<typeof useGetAIArticles>
            })
        })

        it('should return ai articles', () => {
            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', 'My Shop'),
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.articles).toMatchObject(
                AIArticlesGroupedFixture,
            )
        })

        it('should return ai articles when a single store account does not have store connection', () => {
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

            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', null),
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.hasAiArticles).toBe(true)
            expect(result.current.articles).toMatchObject(
                AIArticlesGroupedFixture,
            )
        })
        it('should return empty array of articles when multi-store does not have store connection', () => {
            mockedUseConditionalGetAIArticles.mockImplementation(() => {
                return {
                    fetchedArticles: null,
                    isLoading: false,
                } as unknown as ReturnType<typeof useGetAIArticles>
            })

            const { result } = renderHook(() =>
                useGetHelpCenterArticles(1, 'en-US', null),
            )

            expect(mockedUseConditionalGetAIArticles).toHaveBeenCalled()
            expect(result.current.hasAiArticles).toBe(false)
        })
    })
})
