import {useMemo} from 'react'
import {useGetHelpCenterCategoryTree} from 'models/helpCenter/queries'
import {HELP_CENTER_ROOT_CATEGORY_ID} from 'pages/settings/helpCenter/constants'
import {Components, Paths} from 'rest_api/help_center_api/client.generated'

const traverseTree = (
    tree: Components.Schemas.CategoryTreeDto,
    map: Map<number, string>
) => {
    tree.articles?.forEach((article) =>
        map.set(article.id, article.translation_versions.current?.title ?? '')
    )
    tree.children.forEach((child) => traverseTree(child, map))
}

const createArticleTitleMap = (
    tree: Maybe<Components.Schemas.CategoryTreeDto>
) => {
    const map = new Map<number, string>()
    map.set(-1, 'No relevant articles')
    if (!tree) return map
    traverseTree(tree, map)
    return map
}

const useHelpCenterArticleTree = (
    helpCenterId: Maybe<number>,
    locale: Paths.GetCategoryTree.Parameters.Locale = 'en-US'
) => {
    const {data, isFetching} = useGetHelpCenterCategoryTree(
        helpCenterId!,
        HELP_CENTER_ROOT_CATEGORY_ID,
        {
            order_by: 'position',
            order_dir: 'asc',
            locale,
            depth: -1,
            fields: ['articles'],
        },
        {
            enabled: !!helpCenterId,
            refetchOnWindowFocus: false,
        }
    )

    return useMemo(
        () => ({
            data,
            map: createArticleTitleMap(data),
            isLoading: isFetching,
        }),
        [data, isFetching]
    )
}

export default useHelpCenterArticleTree
