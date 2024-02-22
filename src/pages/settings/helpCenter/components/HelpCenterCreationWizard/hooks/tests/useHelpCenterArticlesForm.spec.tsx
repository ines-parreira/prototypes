import 'tests/__mocks__/editionManagerContextMock'

import {renderHook, act} from '@testing-library/react-hooks/dom'
import {waitFor} from '@testing-library/react'
import {
    ArticleTemplateType,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import {ArticleTemplatesGroupedByCategoryFixture} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import {HelpCenterApiArticlesFixture} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import {AIArticlesGroupedFixture} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {useHelpCenterArticlesForm} from '../useHelpCenterArticlesForm'

const mockedCreateArticleMutateAsync = jest.fn()
const mockedCreateArticleTranslationMutateAsync = jest.fn()
const mockedUpdateArticleTranslationMutateAsync = jest.fn()

jest.mock('hooks/useAppSelector')
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('models/helpCenter/queries', () => ({
    useCreateArticle: () => ({
        mutateAsync: mockedCreateArticleMutateAsync,
    }),
    useCreateArticleTranslation: () => ({
        mutateAsync: mockedCreateArticleTranslationMutateAsync,
    }),
    useUpdateArticleTranslation: () => ({
        mutateAsync: mockedUpdateArticleTranslationMutateAsync,
    }),
}))

const helpCenter = HelpCenterApiArticlesFixture
const articles = ArticleTemplatesGroupedByCategoryFixture
const aiArticles = AIArticlesGroupedFixture

describe('useHelpCenterArticlesForm', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('ui state', () => {
        it('should initialize with default values', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            expect(result.current.articles).toEqual(articles)
            expect(result.current.selectedArticle).toBeNull()
        })

        it('should handle article selection', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.handleArticleSelect('howToCancelOrder')
            })

            expect(result.current.articles.orderManagement[0].isSelected).toBe(
                true
            )
        })

        it('should handle article edit', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.handleArticleEdit('howToCancelOrder')
            })

            expect(result.current.selectedArticle).toMatchObject({
                key: 'howToCancelOrder',
                title: 'How to cancel order',
            })
        })

        it('should handle editor close', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.handleEditorClose()
            })

            expect(result.current.selectedArticle).toBeNull()
        })

        it('should handle editor ready', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            const content = '<p>><strong>Test</strong></p>'

            act(() => {
                result.current.handleArticleEdit('howToCancelOrder')
            })
            expect(result.current.selectedArticle).toMatchObject({
                key: 'howToCancelOrder',
                title: 'How to cancel order',
            })

            act(() => {
                result.current.handleEditorReady(content)
            })
            expect(result.current.selectedArticle?.content).toBe(content)
        })

        it('should handle article hover', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.handleArticleHover('howToCancelOrder')
            })

            expect(result.current.hoveredArticle).toBe(
                articles['orderManagement'][0]
            )
        })
    })

    describe('endpoints calls', () => {
        it('should call create an article mock', async () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.handleArticleEdit('howToCancelOrder')
            })

            act(() => {
                result.current.handleEditorSave(
                    'How do I cancel my order <updated>?',
                    '<p>><strong>Test</strong></p>'
                )
            })

            await waitFor(() => {
                expect(mockedCreateArticleMutateAsync).toHaveBeenCalled()
            })
        })

        it('should call create an article translation mock', async () => {
            const articlesWithTranslations: Record<
                string,
                HelpCenterArticleItem[]
            > = {
                ...articles,
                orderManagement: [
                    {
                        key: 'howToCancelOrder',
                        title: 'How do I cancel my order?',
                        id: 1,
                        content: '<p>><strong>Test</strong></p>',
                        isSelected: true,
                        availableLocales: ['en-US'],
                        shouldCreateTranslation: true,
                        type: ArticleTemplateType.Template,
                    },
                ],
            }
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articlesWithTranslations)
            )

            act(() => {
                result.current.handleArticleEdit('howToCancelOrder')
            })

            act(() => {
                result.current.handleEditorSave(
                    'How do I cancel my order <updated>?',
                    '<p>><strong>Test</strong></p>'
                )
            })

            await waitFor(() => {
                expect(
                    mockedCreateArticleTranslationMutateAsync
                ).toHaveBeenCalled()
            })
        })

        it('should call update an article translation mock', async () => {
            const articlesWithTranslations: Record<
                string,
                HelpCenterArticleItem[]
            > = {
                ...articles,
                orderManagement: [
                    {
                        key: 'howToCancelOrder',
                        title: 'How do I cancel my order?',
                        id: 1,
                        content: '<p>><strong>Test</strong></p>',
                        isSelected: true,
                        availableLocales: ['en-US'],
                        type: ArticleTemplateType.Template,
                    },
                ],
            }
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articlesWithTranslations)
            )

            act(() => {
                result.current.handleArticleEdit('howToCancelOrder')
            })

            act(() => {
                result.current.handleEditorSave(
                    'How do I cancel my order <updated>?',
                    '<p>><strong>Test</strong></p>'
                )
            })

            await waitFor(() => {
                expect(
                    mockedUpdateArticleTranslationMutateAsync
                ).toHaveBeenCalled()
            })
        })

        it('should not update articles if key not found', async () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenter, articles)
            )

            act(() => {
                result.current.selectedArticle = null
            })

            act(() => {
                result.current.handleEditorSave(
                    'How do I cancel my order <updated>?',
                    '<p>><strong>Test</strong></p>'
                )
            })

            await waitFor(() => {
                expect(result.current.articles).toMatchObject(articles)
                expect(result.current.selectedArticle).toBeNull()
            })
        })

        describe('handle navigation for article templates', () => {
            it('should SELECTED + NOT EDITED => DRAFT article', async () => {
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, articles)
                )

                act(() => {
                    result.current.handleArticleSelect('shippingPolicy')
                })

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(mockedCreateArticleMutateAsync).toHaveBeenCalledWith(
                        [
                            undefined,
                            {help_center_id: 1},
                            expect.objectContaining({
                                translation: expect.objectContaining({
                                    is_current: false,
                                }),
                            }),
                        ]
                    )
                })
            })

            it('should SELECTED + EDITED => PUBLISHED article', async () => {
                const mockedArticles = {
                    shippingAndDelivery: [
                        {
                            ...articles['shippingAndDelivery'][0],
                            isSelected: true,
                            isTouched: true,
                            id: 1,
                        },
                    ],
                }
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, mockedArticles)
                )

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).toHaveBeenCalledWith([
                        undefined,
                        expect.objectContaining({
                            help_center_id: 1,
                        }),
                        expect.objectContaining({
                            is_current: true,
                        }),
                    ])
                })
            })

            it('should UNSELECTED + EDITED => DRAFT article', async () => {
                const mockedArticles = {
                    shippingAndDelivery: [
                        {
                            ...articles['shippingAndDelivery'][0],
                            isSelected: true,
                            id: 1,
                        },
                    ],
                }

                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, mockedArticles)
                )

                act(() => {
                    result.current.handleArticleSelect('shippingPolicy')
                })

                await waitFor(() => {
                    expect(
                        result.current.articles['shippingAndDelivery'][0]
                            .isSelected
                    ).toBeFalsy()
                })

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).toHaveBeenCalledWith([
                        undefined,
                        expect.objectContaining({
                            help_center_id: 1,
                        }),
                        expect.objectContaining({
                            is_current: false,
                        }),
                    ])
                })
            })

            it('should UNSELECTED + NOT EDITED => NO article', async () => {
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, articles)
                )

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedCreateArticleMutateAsync
                    ).not.toHaveBeenCalled()
                    expect(
                        mockedCreateArticleTranslationMutateAsync
                    ).not.toHaveBeenCalled()
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).not.toHaveBeenCalled()
                })
            })
        })

        describe('handle navigation for AI templates', () => {
            it('should SELECTED + NOT EDITED => PUBLISHED article', async () => {
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, aiArticles)
                )

                act(() => {
                    result.current.handleArticleSelect('ai_Generated_1')
                })

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(mockedCreateArticleMutateAsync).toHaveBeenCalledWith(
                        [
                            undefined,
                            {help_center_id: 1},
                            expect.objectContaining({
                                translation: expect.objectContaining({
                                    is_current: true,
                                }),
                            }),
                        ]
                    )
                })
            })

            it('should SELECTED + EDITED => PUBLISHED article', async () => {
                const mockedAiArticles = {
                    ai: [
                        {
                            ...aiArticles['ai'][0],
                            isSelected: true,
                            isTouched: true,
                            id: 1,
                        },
                    ],
                }
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, mockedAiArticles)
                )

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).toHaveBeenCalledWith([
                        undefined,
                        expect.objectContaining({
                            help_center_id: 1,
                        }),
                        expect.objectContaining({
                            is_current: true,
                        }),
                    ])
                })
            })

            it('should UNSELECTED + EDITED => DRAFT article', async () => {
                const mockedAiArticles = {
                    ai: [
                        {
                            ...aiArticles['ai'][0],
                            isSelected: true,
                            id: 1,
                        },
                    ],
                }

                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, mockedAiArticles)
                )

                act(() => {
                    result.current.handleArticleSelect('ai_Generated_1')
                })

                await waitFor(() => {
                    expect(
                        result.current.articles['ai'][0].isSelected
                    ).toBeFalsy()
                })

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).toHaveBeenCalledWith([
                        undefined,
                        expect.objectContaining({
                            help_center_id: 1,
                        }),
                        expect.objectContaining({
                            is_current: false,
                        }),
                    ])
                })
            })

            it('should UNSELECTED + NOT EDITED => NO article', async () => {
                const {result} = renderHook(() =>
                    useHelpCenterArticlesForm(helpCenter, aiArticles)
                )

                await act(async () => {
                    await result.current.handleNavigationSave()
                })

                await waitFor(() => {
                    expect(
                        mockedCreateArticleMutateAsync
                    ).not.toHaveBeenCalled()
                    expect(
                        mockedCreateArticleTranslationMutateAsync
                    ).not.toHaveBeenCalled()
                    expect(
                        mockedUpdateArticleTranslationMutateAsync
                    ).not.toHaveBeenCalled()
                })
            })
        })
    })
})
