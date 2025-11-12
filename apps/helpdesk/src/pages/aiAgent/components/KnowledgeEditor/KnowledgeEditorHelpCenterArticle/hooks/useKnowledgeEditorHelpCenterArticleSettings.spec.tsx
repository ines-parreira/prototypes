import { assumeMock } from '@repo/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useNotify } from 'hooks/useNotify'
import { flattenCategories } from 'models/helpCenter/utils'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getCategoriesResponseEnglish } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import {
    getCategoryTitlesById,
    useKnowledgeEditorHelpCenterArticleSettings,
} from './useKnowledgeEditorHelpCenterArticleSettings'

const helpCenter = getHelpCentersResponseFixture.data[0]
const categories = flattenCategories(getCategoriesResponseEnglish)

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

describe('useKnowledgeEditorHelpCenterArticleSettings', () => {
    const createWrapper = () => {
        const store = configureMockStore()({})

        return ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )
    }

    const notifyError = jest.fn()

    beforeEach(() => {
        useNotifyMock.mockReturnValue({ error: notifyError } as any)
    })

    it('returns empty article settings', () => {
        const { result } = renderHook(
            () =>
                useKnowledgeEditorHelpCenterArticleSettings({
                    helpCenter,
                    supportedLocales: getLocalesResponseFixture,
                    articleLocales: getSingleArticleEnglish.available_locales,
                    currentLocale: 'en-US',
                    onChangeLocale: jest.fn(),
                    onLocaleActionClick: jest.fn(),
                    behavior: {
                        type: 'controlled',
                        onChanges: jest.fn(),
                    },
                    categories,
                }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.category).toEqual(
            expect.objectContaining({
                categoryId: null,
                categoryTitlesById: getCategoryTitlesById(categories),
                onChangeCategory: expect.any(Function),
            }),
        )

        expect(result.current.language).toEqual(
            expect.objectContaining({
                locale: 'en-US',
                onChangeLanguage: expect.any(Function),
                onActionClick: expect.any(Function),
            }),
        )
        expect(result.current.visibility).toEqual({
            visibilityStatus: 'PUBLIC',
            onChangeVisibility: expect.any(Function),
            isParentUnlisted: false,
        })
        expect(result.current.slug).toEqual(undefined)
        expect(result.current.excerpt).toEqual({
            excerpt: '',
            onChangeExcerpt: expect.any(Function),
        })
        expect(result.current.metaTitle).toEqual({
            metaTitle: '',
            onChangeMetaTitle: expect.any(Function),
        })
        expect(result.current.metaDescription).toEqual({
            metaDescription: '',
            onChangeMetaDescription: expect.any(Function),
        })
        expect(result.current.autoSave).toEqual(undefined)
        expect(result.current.title).toEqual('')
    })

    it('returns empty article settings with auto save behavior', async () => {
        const updateArticle = jest.fn()

        const { result } = renderHook(
            () =>
                useKnowledgeEditorHelpCenterArticleSettings({
                    helpCenter,
                    categories,
                    supportedLocales: getLocalesResponseFixture,
                    articleLocales: getSingleArticleEnglish.available_locales,
                    currentLocale: 'en-US',
                    onChangeLocale: jest.fn(),
                    onLocaleActionClick: jest.fn(),
                    behavior: {
                        type: 'autosave',
                        updateArticle,
                    },
                }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.autoSave).toEqual({
            state: AutoSaveState.INITIAL,
            updatedAt: undefined,
        })

        await waitFor(() => {
            expect(updateArticle).not.toHaveBeenCalled()
        })
    })

    it('returns article settings with controlled behavior', async () => {
        const onChangeLocale = jest.fn()
        const onLocaleActionClick = jest.fn()
        const onChanges = jest.fn()

        const { result } = renderHook(
            () =>
                useKnowledgeEditorHelpCenterArticleSettings({
                    helpCenter,
                    article: getSingleArticleEnglish,
                    supportedLocales: getLocalesResponseFixture,
                    articleLocales: getSingleArticleEnglish.available_locales,
                    currentLocale: 'en-US',
                    onChangeLocale,
                    onLocaleActionClick,
                    behavior: {
                        type: 'controlled',
                        onChanges,
                    },
                    categories,
                }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.category).toEqual(
            expect.objectContaining({
                categoryId: getSingleArticleEnglish.translation.category_id,
                categoryTitlesById: getCategoryTitlesById(categories),
                onChangeCategory: expect.any(Function),
            }),
        )

        expect(result.current.language).toEqual(
            expect.objectContaining({
                locale: 'en-US',
                onChangeLanguage: onChangeLocale,
                onActionClick: onLocaleActionClick,
            }),
        )

        expect(result.current.visibility).toEqual(
            expect.objectContaining({
                visibilityStatus:
                    getSingleArticleEnglish.translation.visibility_status,
                onChangeVisibility: expect.any(Function),
                isParentUnlisted: false,
            }),
        )

        expect(result.current.slug).toEqual(
            expect.objectContaining({
                slug: getSingleArticleEnglish.translation.slug,
                onChangeSlug: expect.any(Function),
                articleId: getSingleArticleEnglish.id,
            }),
        )

        expect(result.current.excerpt).toEqual(
            expect.objectContaining({
                excerpt: getSingleArticleEnglish.translation.excerpt,
                onChangeExcerpt: expect.any(Function),
            }),
        )

        expect(result.current.metaTitle).toEqual(
            expect.objectContaining({
                metaTitle:
                    getSingleArticleEnglish.translation.seo_meta?.title ?? '',
                onChangeMetaTitle: expect.any(Function),
            }),
        )

        expect(result.current.metaDescription).toEqual(
            expect.objectContaining({
                metaDescription:
                    getSingleArticleEnglish.translation.seo_meta?.description ??
                    '',
                onChangeMetaDescription: expect.any(Function),
            }),
        )

        expect(result.current.autoSave).toEqual(undefined)
        expect(result.current.title).toEqual(
            getSingleArticleEnglish.translation.title,
        )

        act(() => {
            result.current.category.onChangeCategory(categories[1].id)
            result.current.visibility.onChangeVisibility('UNLISTED')
            result.current.slug?.onChangeSlug('new-slug')
            result.current.excerpt?.onChangeExcerpt('new-excerpt')
            result.current.metaTitle?.onChangeMetaTitle('new-meta-title')
            result.current.metaDescription?.onChangeMetaDescription(
                'new-meta-description',
            )
        })

        await waitFor(
            () => {
                expect(onChanges.mock.calls.length).toBe(1)
                expect(onChanges).toHaveBeenCalledWith({
                    category_id: categories[1].id,
                    excerpt: 'new-excerpt',
                    seo_meta: {
                        description: 'new-meta-description',
                        title: 'new-meta-title',
                    },
                    slug: 'new-slug',
                    visibility_status: 'UNLISTED',
                })
            },
            { timeout: 1500 },
        )
    })

    it('returns article settings with auto save behavior', async () => {
        const onChangeLocale = jest.fn()
        const onLocaleActionClick = jest.fn()
        const updateArticle = jest.fn()

        const { result } = renderHook(
            () =>
                useKnowledgeEditorHelpCenterArticleSettings({
                    helpCenter,
                    article: getSingleArticleEnglish,
                    supportedLocales: getLocalesResponseFixture,
                    articleLocales: getSingleArticleEnglish.available_locales,
                    currentLocale: 'en-US',
                    onChangeLocale,
                    onLocaleActionClick,
                    behavior: {
                        type: 'autosave',
                        updateArticle,
                    },
                    categories,
                }),
            {
                wrapper: createWrapper(),
            },
        )

        expect(result.current.category).toEqual(
            expect.objectContaining({
                categoryId: getSingleArticleEnglish.translation.category_id,
                categoryTitlesById: getCategoryTitlesById(categories),
                onChangeCategory: expect.any(Function),
            }),
        )

        expect(result.current.language).toEqual(
            expect.objectContaining({
                locale: 'en-US',
                onChangeLanguage: onChangeLocale,
                onActionClick: onLocaleActionClick,
            }),
        )

        expect(result.current.visibility).toEqual(
            expect.objectContaining({
                visibilityStatus:
                    getSingleArticleEnglish.translation.visibility_status,
                onChangeVisibility: expect.any(Function),
                isParentUnlisted: false,
            }),
        )

        expect(result.current.slug).toEqual(
            expect.objectContaining({
                slug: getSingleArticleEnglish.translation.slug,
                onChangeSlug: expect.any(Function),
                articleId: getSingleArticleEnglish.id,
            }),
        )

        expect(result.current.excerpt).toEqual(
            expect.objectContaining({
                excerpt: getSingleArticleEnglish.translation.excerpt,
                onChangeExcerpt: expect.any(Function),
            }),
        )

        expect(result.current.metaTitle).toEqual(
            expect.objectContaining({
                metaTitle:
                    getSingleArticleEnglish.translation.seo_meta?.title ?? '',
                onChangeMetaTitle: expect.any(Function),
            }),
        )

        expect(result.current.metaDescription).toEqual(
            expect.objectContaining({
                metaDescription:
                    getSingleArticleEnglish.translation.seo_meta?.description ??
                    '',
                onChangeMetaDescription: expect.any(Function),
            }),
        )

        expect(result.current.autoSave).toEqual({
            state: AutoSaveState.INITIAL,
            updatedAt: undefined,
        })
        expect(result.current.title).toEqual(
            getSingleArticleEnglish.translation.title,
        )

        act(() => {
            result.current.category.onChangeCategory(categories[1].id)
            result.current.visibility.onChangeVisibility('UNLISTED')
            result.current.slug?.onChangeSlug('new-slug')
            result.current.excerpt?.onChangeExcerpt('new-excerpt')
            result.current.metaTitle?.onChangeMetaTitle('new-meta-title')
            result.current.metaDescription?.onChangeMetaDescription(
                'new-meta-description',
            )
        })

        await waitFor(
            () => {
                expect(updateArticle.mock.calls.length).toBe(1)
                expect(updateArticle).toHaveBeenCalledWith({
                    category_id: categories[1].id,
                    excerpt: 'new-excerpt',
                    seo_meta: {
                        description: 'new-meta-description',
                        title: 'new-meta-title',
                    },
                    slug: 'new-slug',
                    visibility_status: 'UNLISTED',
                })
            },
            { timeout: 1500 },
        )
    })

    it('handles errors in auto save behavior', async () => {
        const onChangeLocale = jest.fn()
        const onLocaleActionClick = jest.fn()
        const updateArticle = jest.fn().mockRejectedValue(new Error('Error'))

        const { result } = renderHook(
            () =>
                useKnowledgeEditorHelpCenterArticleSettings({
                    helpCenter,
                    article: getSingleArticleEnglish,
                    supportedLocales: getLocalesResponseFixture,
                    articleLocales: getSingleArticleEnglish.available_locales,
                    currentLocale: 'en-US',
                    onChangeLocale,
                    onLocaleActionClick,
                    behavior: {
                        type: 'autosave',
                        updateArticle,
                    },
                    categories,
                }),
            {
                wrapper: createWrapper(),
            },
        )

        act(() => {
            result.current.category.onChangeCategory(categories[1].id)
            result.current.visibility.onChangeVisibility('UNLISTED')
            result.current.slug?.onChangeSlug('new-slug')
            result.current.excerpt?.onChangeExcerpt('new-excerpt')
            result.current.metaTitle?.onChangeMetaTitle('new-meta-title')
            result.current.metaDescription?.onChangeMetaDescription(
                'new-meta-description',
            )
        })

        await waitFor(
            () => {
                expect(updateArticle).toHaveBeenCalled()
                expect(result.current.autoSave).toEqual({
                    state: AutoSaveState.INITIAL,
                    updatedAt: undefined,
                })
            },
            { timeout: 1500 },
        )
        expect(notifyError).toHaveBeenCalledWith(
            'An error occurred while saving the settings.',
        )
    })
})
