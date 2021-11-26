import {useCallback, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'

import {Paths} from '../../../../../../../rest_api/help_center_api/client.generated'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {Article} from '../../../../models/helpCenter/types'
import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {
    getArticlesInCategory,
    getUncategorizedArticles,
    saveArticles,
} from '../../../../state/helpCenter/articles'
import {ARTICLES_PER_PAGE} from '../constants'

import {useHelpCenterApi} from './useHelpCenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useArticles = (
    categoryId: number | null,
    params: Pick<Paths.ListArticles.QueryParameters, 'per_page'> = {
        per_page: ARTICLES_PER_PAGE,
    }
): {
    articles: Article[]
    isLoading: boolean
    hasMore: boolean
    itemCount: number
    fetchMore: () => Promise<void>
} => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {client} = useHelpCenterApi()
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setLoading] = useState(false)
    const [itemCount, setItemCount] = useState(0)
    const hasMore = useMemo(
        () => articles.length < itemCount,
        [articles, itemCount]
    )
    const storedArticles = useSelector(
        categoryId !== null
            ? getArticlesInCategory(categoryId)
            : getUncategorizedArticles
    )

    const fetchArticles = useCallback(
        async (params: {page: number; per_page: number}) => {
            if (client) {
                setLoading(true)

                try {
                    const getArticlesPromise =
                        categoryId !== null
                            ? client.listCategoryArticles({
                                  ...params,
                                  help_center_id: helpCenterId,
                                  category_id: categoryId,
                                  order_by: 'position',
                              })
                            : client.listArticles({
                                  ...params,
                                  help_center_id: helpCenterId,
                                  has_category: false,
                                  order_by: 'position',
                              })
                    const getPositionsPromise =
                        categoryId !== null
                            ? client.getCategoryArticlesPositions({
                                  help_center_id: helpCenterId,
                                  category_id: categoryId,
                              })
                            : client.getUncategorizedArticlesPositions({
                                  help_center_id: helpCenterId,
                              })

                    const {data: articles, meta} =
                        await getArticlesPromise.then(
                            (response) => response.data
                        )

                    const positions = await getPositionsPromise.then(
                        (response) => response.data
                    )

                    const payload = articles.map((article) =>
                        createArticleFromDto(
                            article,
                            positions.findIndex((index) => index === article.id)
                        )
                    )

                    dispatch(saveArticles(payload))

                    setItemCount(meta.item_count)

                    if (params.page === 1) {
                        setArticles(payload)
                    } else {
                        setArticles((prevArticles) =>
                            Object.values(
                                [...prevArticles, ...payload].reduce<Article[]>(
                                    (acc, article) => ({
                                        ...acc,
                                        [article.id]: article,
                                    }),
                                    []
                                )
                            )
                        )
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
        },
        [client]
    )

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            const {per_page} = params
            const page = Math.floor(articles.length / per_page) + 1

            await fetchArticles({page, per_page})
        }
    }, [articles.length, hasMore, isLoading, params, fetchArticles])

    useEffect(() => {
        const {per_page} = params

        void fetchArticles({page: 1, per_page})
    }, [])

    useEffect(() => {
        if (isLoading) return

        // Check if an article was added/deleted from the category
        if (storedArticles.length < articles.length) {
            // If an article was deleted, refresh current list
            void fetchArticles({page: 1, per_page: articles.length})
        } else if (storedArticles.length > articles.length) {
            // If an article was added, fetch all articles
            void fetchArticles({page: 1, per_page: itemCount + 1})
        }
    }, [articles, storedArticles])

    return {articles, isLoading, hasMore, itemCount, fetchMore}
}
