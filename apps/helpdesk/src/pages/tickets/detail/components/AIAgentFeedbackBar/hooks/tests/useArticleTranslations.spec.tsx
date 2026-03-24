import { reportError } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { useGetArticleTranslations } from 'models/helpCenter/queries'
import type {
    ArticleTranslationWithRating,
    LocaleCode,
} from 'models/helpCenter/types'
import {
    getArticleFixture,
    getCreateArticleDtoFixture,
} from 'pages/aiAgent/fixtures/article.fixture'
import { getArticleTranslationWithRatingFixture } from 'pages/aiAgent/fixtures/articleTranslation.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { notify } from 'state/notifications/actions'

import { useArticleTranslations } from '../useArticleTranslations'

jest.mock('hooks/useAppDispatch')
jest.mock('models/helpCenter/queries')
jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
jest.mock('state/notifications/actions')
jest.mock('@repo/logging')

const mockReportError = reportError as jest.Mock
const mockUseGetArticleTranslations = useGetArticleTranslations as jest.Mock

describe('useArticleTranslations', () => {
    const mockDispatch = jest.fn()
    const mockHelpCenter = {
        id: 1,
        supported_locales: ['en-US', 'fr-FR', 'es-ES'] as LocaleCode[],
    }
    const existingArticle = getArticleFixture(1)

    const mockTranslations: ArticleTranslationWithRating[] = [
        getArticleTranslationWithRatingFixture(1, 'en-US'),
        getArticleTranslationWithRatingFixture(1, 'fr-FR', {
            title: 'French Title',
            content: '<p>French content</p>',
            excerpt: 'French excerpt',
            slug: 'french-title',
            rating: { up: 3, down: 0 },
        }),
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockReportError.mockClear()
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(useCurrentHelpCenter as jest.Mock).mockReturnValue(mockHelpCenter)
        ;(notify as jest.Mock).mockReturnValue({ type: 'NOTIFY' })

        mockUseGetArticleTranslations.mockReturnValue({
            data: { data: mockTranslations },
            isLoading: false,
            error: null,
        })
    })

    describe('when initializing the hook', () => {
        it('initializes with null values and false loading state', () => {
            mockUseGetArticleTranslations.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            })

            const { result } = renderHook(() =>
                useArticleTranslations(null, null, 'en-US'),
            )

            expect(result.current.selectedArticleTranslations).toBeUndefined()
            expect(result.current.selectedTranslation).toBeNull()
            expect(result.current.isFetchingArticleTranslations).toBe(false)
        })

        it('does not fetch translations for new articles', () => {
            const createArticleDto = getCreateArticleDtoFixture()

            renderHook(() =>
                useArticleTranslations(createArticleDto, 1, 'en-US'),
            )

            expect(mockUseGetArticleTranslations).toHaveBeenCalledWith(
                mockHelpCenter.id,
                0,
                { version_status: 'latest_draft' },
                { enabled: false },
            )
        })
    })

    describe('when fetching translations for existing articles', () => {
        it('fetches translations and updates state with API response', async () => {
            const { result } = renderHook(() =>
                useArticleTranslations(existingArticle, 1, 'en-US'),
            )

            expect(mockUseGetArticleTranslations).toHaveBeenCalledWith(
                mockHelpCenter.id,
                existingArticle.id,
                { version_status: 'latest_draft' },
                { enabled: true },
            )

            await waitFor(() => {
                expect(result.current.selectedArticleTranslations).toEqual(
                    mockTranslations,
                )
            })
        })

        it('manages loading state during async operation', async () => {
            mockUseGetArticleTranslations
                .mockReturnValueOnce({
                    data: null,
                    isLoading: true,
                    error: null,
                })
                .mockReturnValueOnce({
                    data: { data: mockTranslations },
                    isLoading: false,
                    error: null,
                })

            const { result, rerender } = renderHook(() =>
                useArticleTranslations(existingArticle, 1, 'en-US'),
            )

            expect(result.current.isFetchingArticleTranslations).toBe(true)

            rerender()

            expect(result.current.isFetchingArticleTranslations).toBe(false)
        })
    })

    describe('when API errors occur', () => {
        it('dispatches error notification and reports error', async () => {
            const apiError = new Error('API Error')
            mockUseGetArticleTranslations.mockReturnValueOnce({
                data: null,
                isLoading: false,
                error: apiError,
            })

            renderHook(() =>
                useArticleTranslations(existingArticle, 1, 'en-US'),
            )

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    expect.objectContaining({ type: 'NOTIFY' }),
                )
            })

            expect(mockReportError).toHaveBeenCalledWith(apiError)
        })
    })

    describe('when getting translation for a specific locale', () => {
        it('returns existing translation when locale is found', async () => {
            const { result } = renderHook(() =>
                useArticleTranslations(existingArticle, 1, 'en-US'),
            )

            await waitFor(() => {
                expect(result.current.selectedArticleTranslations).toEqual(
                    mockTranslations,
                )
            })

            const frenchTranslation = result.current.getTranslationForLocale(
                'fr-FR' as LocaleCode,
            )
            expect(frenchTranslation).toEqual(mockTranslations[1])
        })

        it('returns new empty translation when locale not found', () => {
            const categoryId = 5

            const { result } = renderHook(() =>
                useArticleTranslations(null, categoryId, 'en-US'),
            )

            const germanTranslation = result.current.getTranslationForLocale(
                'de-DE' as LocaleCode,
            )

            expect(germanTranslation).toEqual(
                expect.objectContaining({
                    locale: 'de-DE',
                    title: '',
                    content: '',
                    excerpt: '',
                    slug: '',
                    category_id: categoryId,
                    visibility_status: 'PUBLIC',
                    seo_meta: { title: null, description: null },
                    is_current: false,
                }),
            )
        })
    })
})
