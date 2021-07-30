import {
    Category,
    CreateCategoryResponse,
    UpdateCategoryTranslationResponse,
    HelpCenterArticle,
    CategoryTranslation,
    ArticleWithLocalTranslation,
} from './types'

export function createCategoryTranslationFromDto(
    translation?: UpdateCategoryTranslationResponse
): CategoryTranslation {
    if (!translation) {
        throw new Error(
            'Expected translation for category. Check HTTP response'
        )
    }

    return {
        created_datetime: translation.created_datetime || '',
        updated_datetime: translation.updated_datetime || '',
        deleted_datetime: translation.deleted_datetime || null,
        category_id: translation.category_id,
        locale: translation.locale,
        title: translation.title,
        description: translation.description,
        slug: translation.slug,
    }
}

export function createCategoryFromDto(
    payload: CreateCategoryResponse,
    position: number,
    articles?: HelpCenterArticle[]
): Category {
    if (!payload.translation) {
        throw new Error(
            'Expected translation for category. Check HTTP response'
        )
    }
    return {
        ...payload,
        position,
        articles: articles || [],
        translation: createCategoryTranslationFromDto(payload.translation),
    }
}

export function createArticleFromDto(
    payload: ArticleWithLocalTranslation,
    position: number
): HelpCenterArticle {
    if (!payload.translation) {
        throw new Error('Expected translation for article. Check HTTP response')
    }

    return {
        ...payload,
        translation: payload.translation,
        position,
    }
}
