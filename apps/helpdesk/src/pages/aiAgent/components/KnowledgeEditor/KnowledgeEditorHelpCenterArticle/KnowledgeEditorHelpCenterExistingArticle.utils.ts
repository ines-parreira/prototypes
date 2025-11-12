import { AxiosResponse } from 'axios'

import {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
    LocalArticleTranslation,
    LocaleCode,
    VisibilityStatus,
} from 'models/helpCenter/types'

import { ArticleModes } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'

export type ArticleState = ArticleWithLocalTranslation & {
    translationMode: 'existing' | 'new'
}

export const newTranslation = (
    article: Omit<ArticleWithLocalTranslation, 'translation'>,
    locale: LocaleCode,
): LocalArticleTranslation => {
    const now = new Date().toISOString()
    return {
        created_datetime: now,
        updated_datetime: now,
        title: '',
        excerpt: '',
        content: '',
        slug: '',
        locale,
        article_id: article.id,
        category_id: null,
        article_unlisted_id: article.unlisted_id,
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC',
        is_current: true,
    }
}

export const mergeResponseSettingsInArticle =
    (response: AxiosResponse<ArticleTranslationResponseDto, any> | null) =>
    (prev: ArticleState): ArticleState => {
        if (!response?.data || !prev) {
            return prev
        }

        const {
            title: __title,
            content: __content,
            ...updatedFields
        } = response.data

        return {
            ...prev,
            translation: {
                ...prev.translation,
                ...updatedFields,
            },
        }
    }

export const mergeContentAndTitleInArticle =
    (content: string, title: string) =>
    (prev: ArticleState): ArticleState => ({
        ...prev,
        translation: {
            ...prev.translation,
            content,
            title,
        },
    })

export const mergeResponseContentAndTitleInArticle =
    (response: ArticleTranslationResponseDto | undefined) =>
    (prev: ArticleState): ArticleState =>
        response
            ? mergeContentAndTitleInArticle(
                  response.content,
                  response.title,
              )(prev)
            : prev

export const editModeFromVisibilityStatus = (
    visibilityStatus: VisibilityStatus,
): ArticleModes =>
    visibilityStatus === 'PUBLIC'
        ? ArticleModes.EDIT_PUBLISHED
        : ArticleModes.EDIT_DRAFT
