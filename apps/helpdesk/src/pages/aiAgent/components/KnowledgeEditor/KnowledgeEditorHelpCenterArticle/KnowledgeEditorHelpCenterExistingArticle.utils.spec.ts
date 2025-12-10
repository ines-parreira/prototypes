import type { AxiosResponse } from 'axios'

import type { ArticleTranslationResponseDto } from 'models/helpCenter/types'

import { ArticleModes } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import type { ArticleState } from './KnowledgeEditorHelpCenterExistingArticle.utils'
import {
    editModeFromVisibilityStatus,
    mergeResponseContentAndTitleInArticle,
    mergeResponseSettingsInArticle,
    newTranslation,
} from './KnowledgeEditorHelpCenterExistingArticle.utils'

const dateNow = new Date('2025-02-01T08:10:30Z')
jest.useFakeTimers().setSystemTime(dateNow)

describe('KnowledgeEditorHelpCenterExistingArticle.utils', () => {
    const currentState: ArticleState = {
        translationMode: 'existing',
        id: 1,
        unlisted_id: '1',
        created_datetime: '2024-01-01T00:00:00Z',
        updated_datetime: '2024-01-01T00:00:00Z',
        available_locales: ['en-US'],
        category_id: null,
        help_center_id: 1,
        template_key: null,
        origin: undefined,
        ingested_resource_id: null,
        translation: {
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            excerpt: 'Test Article',
            content: 'Test Article',
            slug: 'test-article',
            locale: 'en-US',
            article_id: 1,
            category_id: null,
            article_unlisted_id: '1',
            title: 'Test Article',
            seo_meta: {
                title: null,
                description: null,
            },
            visibility_status: 'PUBLIC',
            is_current: true,
            draft_version_id: null,
            published_version_id: null,
        },
    }

    describe('newTranslation', () => {
        it('creates a new translation', () => {
            const {
                translation: __,
                translationMode: ___,
                ...article
            } = currentState

            expect(newTranslation(article, 'en-US')).toEqual({
                created_datetime: dateNow.toISOString(),
                updated_datetime: dateNow.toISOString(),
                title: '',
                excerpt: '',
                content: '',
                slug: '',
                locale: 'en-US',
                article_id: 1,
                category_id: null,
                article_unlisted_id: '1',
                draft_version_id: null,
                published_version_id: null,
                seo_meta: {
                    title: null,
                    description: null,
                },
                visibility_status: 'PUBLIC',
                is_current: true,
            })
        })
    })

    describe('mergeResponseSettingsInArticle', () => {
        it('returns current state if response is null', () => {
            expect(mergeResponseSettingsInArticle(null)(currentState)).toEqual(
                currentState,
            )
        })

        it('merges the response settings into the article', () => {
            expect(
                mergeResponseSettingsInArticle({
                    data: {
                        ...currentState.translation,
                        title: 'DIFFERENT TITLE',
                        excerpt: 'DIFFERENT EXCERPT',
                        content: 'DIFFERENT CONTENT',
                        slug: 'DIFFERENT SLUG',
                        locale: 'en-US',
                        article_id: 1,
                        category_id: 10,
                        article_unlisted_id: '42',
                        seo_meta: {
                            title: 'DIFFERENT SEO TITLE',
                            description: 'DIFFERENT SEO DESCRIPTION',
                        },
                        visibility_status: 'UNLISTED',
                        is_current: false,
                    },
                } as AxiosResponse<ArticleTranslationResponseDto, any>)(
                    currentState,
                ),
            ).toEqual({
                ...currentState,
                translation: {
                    ...currentState.translation,
                    slug: 'DIFFERENT SLUG',
                    excerpt: 'DIFFERENT EXCERPT',
                    category_id: 10,
                    article_unlisted_id: '42',
                    seo_meta: {
                        title: 'DIFFERENT SEO TITLE',
                        description: 'DIFFERENT SEO DESCRIPTION',
                    },
                    visibility_status: 'UNLISTED',
                    is_current: false,
                },
            })
        })
    })

    describe('mergeResponseContentAndTitleInArticle', () => {
        it('returns current state if response is null', () => {
            expect(
                mergeResponseContentAndTitleInArticle(undefined)(currentState),
            ).toEqual(currentState)
        })

        it('merges the response content and title into the article', () => {
            expect(
                mergeResponseContentAndTitleInArticle({
                    ...currentState.translation,
                    title: 'DIFFERENT TITLE',
                    excerpt: 'DIFFERENT EXCERPT',
                    content: 'DIFFERENT CONTENT',
                    slug: 'DIFFERENT SLUG',
                    locale: 'en-US',
                    article_id: 1,
                    category_id: 10,
                    article_unlisted_id: '42',
                    seo_meta: {
                        title: 'DIFFERENT SEO TITLE',
                        description: 'DIFFERENT SEO DESCRIPTION',
                    },
                    visibility_status: 'UNLISTED',
                    is_current: false,
                } as ArticleTranslationResponseDto)(currentState),
            ).toEqual({
                ...currentState,
                translation: {
                    ...currentState.translation,
                    title: 'DIFFERENT TITLE',
                    content: 'DIFFERENT CONTENT',
                },
            })
        })
    })

    describe('editModeFromVisibilityStatus', () => {
        it('returns EDIT_PUBLISHED if visibility status is PUBLIC', () => {
            expect(editModeFromVisibilityStatus('PUBLIC')).toEqual(
                ArticleModes.EDIT_PUBLISHED,
            )
        })

        it('returns EDIT_DRAFT if visibility status is UNLISTED', () => {
            expect(editModeFromVisibilityStatus('UNLISTED')).toEqual(
                ArticleModes.EDIT_DRAFT,
            )
        })
    })
})
