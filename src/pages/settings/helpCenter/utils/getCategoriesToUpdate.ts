import {cloneDeep as _cloneDeep} from 'lodash'
import {Category, NonRootCategory} from 'models/helpCenter/types'

type Props = {
    categories: Record<string, Category>
    categoryId: number
    previousParentId: number | null
    currentParentId: number | null
}
export const getCategoriesToUpdate = ({
    categories,
    categoryId,
    previousParentId,
    currentParentId,
}: Props): Category[] => {
    const categoriesToUpdate: Category[] = []
    const categoriesById: Record<string, Category> = _cloneDeep(categories)

    if (previousParentId !== currentParentId) {
        // Update the edited category
        const category = categoriesById[
            categoryId.toString()
        ] as NonRootCategory

        category.parent_category_id = currentParentId
        category.translation.parent_category_id = currentParentId

        categoriesToUpdate.push(category)

        // Update the category that was parent to the edited category
        const previousParent = previousParentId
            ? categoriesById[previousParentId]
            : categoriesById['0']

        const previousParentChildren = removeElementFromArray(
            previousParent.children,
            categoryId
        )

        categoriesToUpdate.push({
            ...previousParent,
            children: previousParentChildren,
        })

        // Update the category that will be the parent to the edited category
        const currentParent = currentParentId
            ? categoriesById[currentParentId]
            : categoriesById['0']

        categoriesToUpdate.push({
            ...currentParent,
            children: [...currentParent.children, categoryId],
        })
    }

    return categoriesToUpdate
}

export const removeElementFromArray = (arr: number[], id: number) => {
    const childrenArray = [...arr]

    return childrenArray.filter((element) => element !== id)
}
