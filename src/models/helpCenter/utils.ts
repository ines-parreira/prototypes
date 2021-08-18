import {
    Category,
    CategoryWithLocalTranslation,
    UpdateCategoryTranslationResponse,
    HelpCenterArticle,
    CategoryTranslation,
    ArticleWithLocalTranslation,
    LocaleCode,
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
    payload: CategoryWithLocalTranslation,
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
        available_locales: payload?.available_locales || [
            payload.translation.locale,
        ],
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
        available_locales: payload?.available_locales || [
            payload.translation.locale,
        ],
        translation: payload.translation,
        position,
    }
}

function assertIsLocaleCode(code: unknown): asserts code is LocaleCode {
    const allowedCodes = [
        'en-US',
        'fr-FR',
        'fr-CA',
        'es-ES',
        'de-DE',
        'nl-NL',
        'cs-CZ',
        'da-DK',
        'no-NO',
        'it-IT',
        'sv-SE',
    ]
    if (allowedCodes.indexOf(String(code)) === -1) {
        throw new TypeError(`${String(code)} is not a supported locale code`)
    }
}

export function validLocaleCode(code: unknown): LocaleCode {
    assertIsLocaleCode(code)
    return code
}
