import { useMemo } from 'react'

import { doNotRetry40XErrorsHandler } from 'api/utils'
import { LocaleCode } from 'models/helpCenter/types'

import { useGetAIArticlesByHelpCenterAndStore } from '../queries'
import { getAIGeneratedArticlesByHelpCenterAndStore } from '../resources'

type AIArticlesByHelpCenterAndStore = Awaited<
    ReturnType<typeof getAIGeneratedArticlesByHelpCenterAndStore>
>

type FetchedArticles = AIArticlesByHelpCenterAndStore | null

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
    const { data, isInitialLoading } = useGetAIArticlesByHelpCenterAndStore(
        helpCenterId,
        storeIntegrationId,
        locale,
        {
            refetchOnWindowFocus: false,
            retry: doNotRetry40XErrorsHandler,
            ...(enabled !== undefined ? { enabled } : {}),
        },
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

    return { fetchedArticles, isLoading: isInitialLoading }
}
