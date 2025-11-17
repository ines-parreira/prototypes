import { renderHook } from '@testing-library/react'

import type {
    ArticleTranslationWithRating,
    CreateArticleDto,
} from 'models/helpCenter/types'
import {
    getArticleFixture,
    getCreateArticleDtoFixture,
} from 'pages/aiAgent/fixtures/article.fixture'

import { useArticleValidation } from '../useArticleValidation'

describe('useArticleValidation', () => {
    const baseTranslation = {
        locale: 'en-US' as const,
        title: 'Test Article Title',
        content: '<p>Test article content</p>',
        excerpt: 'Test excerpt',
        slug: 'test-article-title',
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC' as const,
        is_current: false,
        category_id: 1,
    }

    const mockSelectedArticle = getCreateArticleDtoFixture({
        translation: baseTranslation,
    })

    const mockSelectedTranslation: ArticleTranslationWithRating = {
        ...getArticleFixture(1).translation,
        ...baseTranslation,
    }

    const defaultProps = {
        selectedArticle: mockSelectedArticle,
        selectedTranslation: mockSelectedTranslation,
        selectedCategoryId: 1,
        isLoading: false,
        isEditorCodeViewActive: false,
    }

    it('should return canSaveArticle as false when isLoading is true', () => {
        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                isLoading: true,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.articleModified).toBe(true)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should return canSaveArticle as false when selectedArticle has no translation', () => {
        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedArticle: null,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.articleModified).toBe(true)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should return canSaveArticle as false when isEditorCodeViewActive is true', () => {
        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                isEditorCodeViewActive: true,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.articleModified).toBe(true)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should return canSaveArticle as true when creating new article with all required fields', () => {
        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedTranslation: null,
            }),
        )

        expect(result.current.canSaveArticle).toBe(true)
        expect(result.current.articleModified).toBe(false)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should return canSaveArticle as false when creating new article with missing required fields', () => {
        const articleWithMissingFields = getCreateArticleDtoFixture({
            translation: {
                ...getCreateArticleDtoFixture().translation,
                title: '',
                category_id: 1,
            },
        })

        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedArticle: articleWithMissingFields,
                selectedTranslation: null,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.articleModified).toBe(false)
        expect(result.current.requiredFieldsArticle).toContain('title')
        expect(result.current.requiredFieldsArticle).toHaveLength(1)
    })

    it('should detect article modification when translation content changes', () => {
        const modifiedArticle: CreateArticleDto = {
            translation: {
                ...mockSelectedArticle.translation,
                content: '<p>Modified content</p>',
            },
        }

        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedArticle: modifiedArticle,
            }),
        )

        expect(result.current.canSaveArticle).toBe(true)
        expect(result.current.articleModified).toBe(true)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should detect article modification when category changes', () => {
        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedCategoryId: 2,
            }),
        )

        expect(result.current.canSaveArticle).toBe(true)
        expect(result.current.articleModified).toBe(true)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should return canSaveArticle as false when article is not modified', () => {
        // Create a scenario where the translations are actually equal
        const sameTranslation = mockSelectedTranslation
        const articleWithSameTranslation = {
            ...mockSelectedArticle,
            translation: sameTranslation,
        }

        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedArticle: articleWithSameTranslation,
                selectedTranslation: sameTranslation,
                selectedCategoryId: sameTranslation.category_id,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.articleModified).toBe(false)
        expect(result.current.requiredFieldsArticle).toHaveLength(0)
    })

    it('should identify multiple missing required fields', () => {
        const articleWithMultipleMissingFields: CreateArticleDto = {
            ...mockSelectedArticle,
            translation: {
                ...mockSelectedArticle.translation,
                content: '',
                title: '',
                slug: '',
            },
        }

        const { result } = renderHook(() =>
            useArticleValidation({
                ...defaultProps,
                selectedArticle: articleWithMultipleMissingFields,
                selectedTranslation: null,
            }),
        )

        expect(result.current.canSaveArticle).toBe(false)
        expect(result.current.requiredFieldsArticle).toContain('title')
        expect(result.current.requiredFieldsArticle).toContain('content')
        expect(result.current.requiredFieldsArticle).toContain('slug')
        expect(result.current.requiredFieldsArticle).toHaveLength(3) // All required fields are missing
    })
})
