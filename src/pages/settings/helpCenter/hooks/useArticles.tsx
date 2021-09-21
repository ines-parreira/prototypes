import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {LocaleCode} from '../../../../models/helpCenter/types'
import {createArticleFromDto} from '../../../../models/helpCenter/utils'

import {
    readArticlesInCategory,
    readUncategorizedArticles,
    saveArticles,
} from '../../../../state/helpCenter/articles'

import {HELP_CENTER_LANGUAGE_DEFAULT} from '../constants'

import {useHelpcenterApi} from './useHelpcenterApi'
import {useHelpCenterIdParam} from './useHelpCenterIdParam'

export const useArticles = (
    locale: LocaleCode = HELP_CENTER_LANGUAGE_DEFAULT,
    categoryId?: number
) => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isReady, client} = useHelpcenterApi()

    const articles = useSelector(
        categoryId && categoryId >= 0
            ? readArticlesInCategory(categoryId)
            : readUncategorizedArticles
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
                                  locale,
                              })
                            : client.listArticles({
                                  help_center_id: helpCenterId,
                                  has_category: false,
                                  locale,
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
    }, [isReady, locale, categoryId])

    return {
        articles,
        isLoading,
    }
}
