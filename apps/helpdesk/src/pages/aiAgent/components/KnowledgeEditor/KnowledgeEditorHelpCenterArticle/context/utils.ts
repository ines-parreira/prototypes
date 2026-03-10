import type {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
    LocalArticleTranslation,
    LocaleCode,
    VisibilityStatus,
} from 'models/helpCenter/types'
import {
    CustomerVisibilityEnum,
    VisibilityStatusEnum,
} from 'models/helpCenter/types'

import type { ArticleModeType } from './types'

export const createEmptyTranslation = (
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
        visibility_status: VisibilityStatusEnum.PUBLIC,
        customer_visibility: CustomerVisibilityEnum.PUBLIC,
        is_current: true,
        draft_version_id: null,
        published_version_id: null,
        published_datetime: null,
        publisher_user_id: null,
        commit_message: null,
        version: null,
    }
}

export const mergeTranslationResponse = (
    article: ArticleWithLocalTranslation,
    response: ArticleTranslationResponseDto,
): ArticleWithLocalTranslation => ({
    ...article,
    translation: {
        ...article.translation,
        ...response,
    },
})

export const mergeContentAndTitle = (
    article: ArticleWithLocalTranslation,
    content: string,
    title: string,
): ArticleWithLocalTranslation => ({
    ...article,
    translation: {
        ...article.translation,
        content,
        title,
    },
})

export const getEditModeFromVisibility = (
    visibilityStatus: VisibilityStatus,
): ArticleModeType =>
    visibilityStatus === VisibilityStatusEnum.PUBLIC ? 'edit' : 'edit'

export const computeHasDraft = (
    article: ArticleWithLocalTranslation | undefined,
): boolean => {
    if (!article) return false
    const { draft_version_id, published_version_id } = article.translation
    return !published_version_id || draft_version_id !== published_version_id
}

export const computeCanEdit = (
    article: ArticleWithLocalTranslation | undefined,
    hasDraft: boolean,
): boolean => {
    if (!article) return true
    const isCurrent = article.translation.is_current
    if (isCurrent && hasDraft) return false
    return true
}
