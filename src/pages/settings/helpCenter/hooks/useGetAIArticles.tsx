import {useMemo} from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import {doNotRetry40XErrorsHandler} from 'api/utils'
import {useGetAIArticlesByHelpCenterAndStore} from '../queries'
import {
    getAIGeneratedArticlesByHelpCenter,
    getAIGeneratedArticlesByHelpCenterAndStore,
} from '../resources'

type AIArticlesByHelpCenter = Awaited<
    ReturnType<typeof getAIGeneratedArticlesByHelpCenter>
>
type AIArticlesByHelpCenterAndStore = Awaited<
    ReturnType<typeof getAIGeneratedArticlesByHelpCenterAndStore>
>

type FetchedArticles =
    | AIArticlesByHelpCenter
    | AIArticlesByHelpCenterAndStore
    | null

type Props = {
    helpCenterId: number | null
    storeIntegrationId: number | null
    locale: LocaleCode
    enabled?: boolean
}

export const useGetAIArticles = ({
    helpCenterId,
    storeIntegrationId,
    locale,
    enabled,
}: Props) => {
    const {data, isInitialLoading} = useGetAIArticlesByHelpCenterAndStore(
        helpCenterId,
        storeIntegrationId,
        locale,
        {
            refetchOnWindowFocus: false,
            retry: doNotRetry40XErrorsHandler,
            ...(enabled !== undefined ? {enabled} : {}),
        }
    )

    const fetchedArticles: FetchedArticles = useMemo(() => {
        if (enabled === false) {
            return null
        }

        if (!isInitialLoading) {
            return data ?? null
        }

        return null
    }, [isInitialLoading, data, enabled])

    return {fetchedArticles, isLoading: isInitialLoading}
}
