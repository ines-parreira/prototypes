import 'tests/__mocks__/editionManagerContextMock'

import {renderHook, act} from '@testing-library/react-hooks/dom'
import {waitFor} from '@testing-library/react'
import {HelpCenterArticleItem} from 'models/helpCenter/types'
import {ArticleTemplatesGroupedByCategoryFixture} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import {HelpCenterApiArticlesFixture} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
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

const helpCenterFixture = HelpCenterApiArticlesFixture
const articles = ArticleTemplatesGroupedByCategoryFixture

describe('useHelpCenterArticlesForm', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('ui state', () => {
        it('should initialize with default values', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenterFixture, articles)
            )

            expect(result.current.articles).toEqual(articles)
            expect(result.current.selectedArticle).toBeNull()
        })

        it('should handle article selection', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenterFixture, articles)
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
                useHelpCenterArticlesForm(helpCenterFixture, articles)
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
                useHelpCenterArticlesForm(helpCenterFixture, articles)
            )

            act(() => {
                result.current.handleEditorClose()
            })

            expect(result.current.selectedArticle).toBeNull()
        })

        it('should handle editor ready', () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenterFixture, articles)
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
    })

    describe('endpoints calls', () => {
        it('should call create an article mock', async () => {
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(helpCenterFixture, articles)
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
                    },
                ],
            }
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(
                    helpCenterFixture,
                    articlesWithTranslations
                )
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
                    },
                ],
            }
            const {result} = renderHook(() =>
                useHelpCenterArticlesForm(
                    helpCenterFixture,
                    articlesWithTranslations
                )
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
                useHelpCenterArticlesForm(helpCenterFixture, articles)
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
    })
})
