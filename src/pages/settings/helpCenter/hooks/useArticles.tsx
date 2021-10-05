import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenterArticle} from '../../../../models/helpCenter/types'
import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {
    getArticlesInCategory,
    getUncategorizedArticles,
    saveArticles,
} from '../../../../state/helpCenter/articles'

import {useHelpcenterApi} from './useHelpcenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useArticles = (
    categoryId?: number
): {
    articles: HelpCenterArticle[]
    isLoading: boolean
} => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isReady, client} = useHelpcenterApi()

    const articles = useSelector(
        categoryId && categoryId >= 0
            ? getArticlesInCategory(categoryId)
            : getUncategorizedArticles
    )
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        async function init() {
            if (isReady && client) {
                setLoading(true)
                try {
                    const getArticlesPromise =
                        categoryId && categoryId >= 0
                            ? client.listCategoryArticles({
                                  help_center_id: helpCenterId,
                                  category_id: categoryId,
                              })
                            : client.listArticles({
                                  help_center_id: helpCenterId,
                                  has_category: false,
                              })
                    const getPositionsResponse =
                        categoryId && categoryId >= 0
                            ? client.getCategoryArticlesPositions({
                                  help_center_id: helpCenterId,
                                  category_id: categoryId,
                              })
                            : client.getUncategorizedArticlesPositions({
                                  help_center_id: helpCenterId,
                              })

                    const articlesResponse = await getArticlesPromise.then(
                        (response) => response.data.data
                    )

                    const positionsResponse = await getPositionsResponse.then(
                        (response) => response.data
                    )

                    const payload = articlesResponse.map((article) =>
                        createArticleFromDto(
                            article,
                            positionsResponse.findIndex(
                                (index) => index === article.id
                            )
                        )
                    )

                    dispatch(saveArticles(payload))
                } catch (err) {
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            }
        }

        void init()
    }, [isReady, categoryId])

    return {
        articles,
        isLoading,
    }
}
