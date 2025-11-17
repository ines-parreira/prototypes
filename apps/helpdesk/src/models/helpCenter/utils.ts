import type {
    Article,
    ArticleWithLocalTranslation,
    Category,
    CategoryWithLocalTranslation,
    LocaleCode,
} from './types'

export function createArticleFromDto(
    payload: ArticleWithLocalTranslation,
    position: number,
): Article {
    return {
        rating: { up: 0, down: 0 },
        ...payload,
        position,
        translation: {
            rating: { up: 0, down: 0 },
            ...payload.translation,
        },
    }
}

/**
 * Given a hierarchical tree, returns a flat array of all nodes in the tree.
 * The children of each node are replaced with an array of their ids.
 *
 * @param tree The root node of the tree
 */
export function flattenTree<Tree extends { id: number; children: Tree[] }>(
    tree: Tree,
): Array<Omit<Tree, 'children'> & { children: number[] }> {
    const flatTree: Array<Omit<Tree, 'children'> & { children: number[] }> = []

    const parseNode = (node: Tree) => {
        const { children, ...category } = node

        flatTree.push({
            ...category,
            children: children.map((child) => child.id),
        })

        node.children.forEach((child) => {
            parseNode(child)
        })
    }

    parseNode(tree)
    return flatTree
}

export function flattenCategories(
    category: CategoryWithLocalTranslation,
): Category[] {
    const flattenCategoriesWithLocalTranslation = flattenTree(category)

    return flattenCategoriesWithLocalTranslation.map((category) => ({
        ...category,
        articleCount: 0,
    }))
}

function assertIsLocaleCode(code: unknown): asserts code is LocaleCode {
    const allowedCodes = [
        'en-US',
        'en-GB',
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
        'fi-FI',
        'ja-JP',
        'pt-BR',
    ]
    if (allowedCodes.indexOf(String(code)) === -1) {
        throw new TypeError(`${String(code)} is not a supported locale code`)
    }
}

export function validLocaleCode(code: unknown): LocaleCode {
    assertIsLocaleCode(code)
    return code
}
