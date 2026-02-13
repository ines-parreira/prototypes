import { useEffect, useMemo, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type {
    AIArticle,
    AILibraryArticleItem,
    ArticleTemplateReviewAction,
    Locale,
} from 'models/helpCenter/types'
import { AIArticleToggleOptionValue } from 'models/helpCenter/types'
import { useHasEmailToStoreConnection } from 'pages/automate/common/components/TopQuestions/useHasEmailToStoreConnection'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import { getValidStoreIntegrationId } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getStoreIntegrations } from 'state/integrations/selectors'

import { mapAILibraryArticlesData } from '../AIArticlesLibraryUtils'

export const useHelpCenterAIArticlesLibrary = (
    helpCenterId: number,
    locale: Locale['code'],
    helpCenterShopName: string | null,
    enabled = true,
) => {
    const [articles, setArticles] = useState<AIArticle[] | null>(null)
    const [mappedArticleItems, setMappedArticleItems] = useState<
        AILibraryArticleItem[]
    >([])

    const allStoreIntegrations = useAppSelector(getStoreIntegrations)
    const hasMultiStores = allStoreIntegrations.length > 1

    const storeIntegrationId = getValidStoreIntegrationId(
        allStoreIntegrations,
        helpCenterShopName,
    )

    const {
        hasEmailToStoreConnection,
        isLoading: isLoadingEmailToStoreConnection,
    } = useHasEmailToStoreConnection(storeIntegrationId ?? undefined)

    const showLinkToConnectEmailToStore = useMemo(
        () =>
            hasMultiStores &&
            (!hasEmailToStoreConnection || isLoadingEmailToStoreConnection),
        [
            hasMultiStores,
            hasEmailToStoreConnection,
            isLoadingEmailToStoreConnection,
        ],
    )

    const { fetchedArticles: fetchedArticles, isLoading: isLoading } =
        useGetAIArticles({
            helpCenterId,
            storeIntegrationId,
            locale,
            enabled,
        })

    const [selectedArticle, setSelectedArticle] =
        useState<AILibraryArticleItem>()

    const latestBatchDate = useMemo(() => {
        const newestArticle = (articles || []).sort(
            (a, b) =>
                new Date(b.batch_datetime || '').getTime() -
                new Date(a.batch_datetime || '').getTime(),
        )?.[0]

        return newestArticle?.batch_datetime
    }, [articles])

    const articlesNotReviewed = useMemo(() => {
        return articles?.filter(
            (article) =>
                !article.review_action ||
                article.review_action === 'dismissFromTopQuestions',
        )
    }, [articles])

    const newArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime === latestBatchDate,
            ) || [],
        [articlesNotReviewed, latestBatchDate],
    )

    const oldArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime !== latestBatchDate,
            ) || [],
        [articlesNotReviewed, latestBatchDate],
    )

    const [selectedArticleType, setSelectedArticleType] =
        useState<AIArticleToggleOptionValue>(AIArticleToggleOptionValue.New)

    useEffect(() => {
        setArticles(fetchedArticles || null)
    }, [fetchedArticles])

    useEffect(() => {
        const mappedArticleItems = mapAILibraryArticlesData(
            articlesNotReviewed || [],
            selectedArticleType,
            latestBatchDate,
        )
        setMappedArticleItems(mappedArticleItems)
        setSelectedArticle(mappedArticleItems?.[0])
    }, [articlesNotReviewed, selectedArticleType, latestBatchDate])

    return {
        articles: mappedArticleItems,
        isLoading,
        counters: articles && {
            [AIArticleToggleOptionValue.New]: newArticles.length,
            [AIArticleToggleOptionValue.Old]: oldArticles.length,
            [AIArticleToggleOptionValue.All]:
                newArticles.length + oldArticles.length,
        },
        selectedArticleType,
        setSelectedArticleType,
        selectedArticle,
        setSelectedArticle,
        hasNewArticles: newArticles.length > 0,
        hasStoreConnectionOrDefaultStore: hasMultiStores
            ? !!storeIntegrationId
            : true,
        showLinkToConnectEmailToStore,
        markArticleAsReviewed: (
            templateKey: string,
            reviewAction: ArticleTemplateReviewAction,
        ) => {
            if (!articles) return

            const articleIndex = articles.findIndex(
                (item) => item.key === templateKey,
            )

            const newArticles = [...articles]
            newArticles[articleIndex] = {
                ...newArticles[articleIndex],
                review_action: reviewAction,
            }

            setArticles(newArticles)
        },
    }
}
