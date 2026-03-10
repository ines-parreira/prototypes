import type {
    Category,
    LocaleCode,
    NonRootCategory,
} from 'models/helpCenter/types'
import { isNonRootCategory } from 'state/entities/helpCenter/categories'

/**
 * Filter out the children of the provided category from the provided categories
 */
export const eligibleParentCategories = (
    categories: Category[],
    locale: LocaleCode,
    currentCategory?: Category,
): NonRootCategory[] => {
    if (!currentCategory) {
        return categories
            .filter(isNonRootCategory)
            .filter(
                (category) => category.available_locales.indexOf(locale) > -1,
            )
    }

    const traverseChildren = (root: Category, childrenIds: number[]) => {
        for (const current of root.children) {
            childrenIds.push(current)
            const foundCategory = categories.find(
                (category) => category.id === current,
            )
            if (foundCategory) {
                traverseChildren(foundCategory, childrenIds)
            }
        }
        return childrenIds
    }

    const childrenCategoryIds = traverseChildren(currentCategory, [])

    return categories
        .filter(isNonRootCategory)
        .filter(
            (category) =>
                category.available_locales.indexOf(locale) > -1 &&
                category.id !== currentCategory.id &&
                !childrenCategoryIds.includes(category.id),
        )
}

export const isOneOfParentsUnlisted = (
    categories: Category[],
    categoryId: number | null,
): boolean => {
    let isUnlisted = false
    const traverseParents = (categoryId: number | null) => {
        if (categoryId) {
            const currentCategory = categories.find(
                (category) => category.id === categoryId,
            )
            isUnlisted =
                isUnlisted ||
                currentCategory?.translation?.customer_visibility === 'UNLISTED'

            if (currentCategory?.translation?.parent_category_id) {
                traverseParents(currentCategory.translation.parent_category_id)
            }
        }
    }
    traverseParents(categoryId)

    return isUnlisted
}
