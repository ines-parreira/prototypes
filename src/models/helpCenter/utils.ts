import {
    Article,
    ArticleWithLocalTranslation,
    Category,
    CategoryWithLocalTranslation,
    LocaleCode,
} from './types'

export function createArticleFromDto(
    payload: ArticleWithLocalTranslation,
    position: number
): Article {
    return {
        rating: {up: 0, down: 0},
        ...payload,
        position,
        translation: {
            rating: {up: 0, down: 0},
            ...payload.translation,
        },
    }
}

export function flattenCategories(
    category: CategoryWithLocalTranslation
): Category[] {
    const flatTree: Category[] = []

    const parseNode = (node: CategoryWithLocalTranslation) => {
        const {children, ...category} = node
        flatTree.push({
            ...category,
            children: children.map((child) => child.id),
            articles: [],
        })

        node.children?.forEach((child) => {
            parseNode(child)
        })
    }

    parseNode(category)
    return flatTree
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
