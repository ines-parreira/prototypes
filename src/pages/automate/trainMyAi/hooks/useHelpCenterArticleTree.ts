import {useMemo} from 'react'
import {useGetHelpCenterCategoryTree} from 'models/helpCenter/queries'
import {HELP_CENTER_ROOT_CATEGORY_ID} from 'pages/settings/helpCenter/constants'
import {Components, Paths} from 'rest_api/help_center_api/client.generated'

const traverseTree = (
    node: Components.Schemas.CategoryTreeDto,
    map: Map<number, string>,
    locale: Paths.GetCategoryTree.Parameters.Locale
) => {
    node.articles = node.articles?.filter((article) =>
        article.available_locales.includes(locale)
    )
    node.articles?.forEach((article) =>
        map.set(article.id, article.translation_versions.current?.title ?? '')
    )
    node.children = node.children?.filter((child) =>
        child.available_locales.includes(locale)
    )
    node.children.forEach((child) => traverseTree(child, map, locale))
}

const filterTreeByLocale = (
    locale: Paths.GetCategoryTree.Parameters.Locale,
    data: Maybe<Components.Schemas.CategoryTreeDto>
) => {
    const map = new Map<number, string>()
    map.set(-1, 'No relevant articles')
    if (!data) return {map}

    const tree = {...data}
    traverseTree(tree, map, locale)
    return {map, data: tree}
}

const useHelpCenterArticleTree = (
    helpCenterId: Maybe<number>,
    locale: Paths.GetCategoryTree.Parameters.Locale = 'en-US'
) => {
    const response = useGetHelpCenterCategoryTree(
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
    const {data, map} = useMemo(
        () => filterTreeByLocale(locale, response.data),

        [response.data, locale]
    )
    return {
        data,
        map,
        isLoading: response.isFetching,
    }
}

export default useHelpCenterArticleTree
