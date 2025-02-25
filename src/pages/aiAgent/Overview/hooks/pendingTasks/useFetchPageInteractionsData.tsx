import { useMemo } from 'react'

import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { usePostReporting } from 'models/reporting/queries'
import { getPageInteractionsCountAfterDate } from 'pages/stats/convert/clients/PageInteractionsCubeQueries'
import { CubeData } from 'pages/stats/convert/clients/types'
import { getTimezone } from 'state/currentUser/selectors'

type Args = {
    storeName: string
    storeType: string
}
export const useFetchPageInteractionsData = ({
    storeName,
    storeType,
}: Args) => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const query = useMemo(() => {
        const _72HoursAgo = moment().subtract(72, 'hours')
        return getPageInteractionsCountAfterDate(
            {
                afterDate: _72HoursAgo.toISOString(),
                shopName: storeName,
                shopType: storeType,
            },
            {
                timezone,
            },
        )
    }, [storeName, storeType, timezone])

    const { isLoading, data: cubeData } = usePostReporting<
        [CubeData],
        CubeData
    >(query)

    // The data fetched by the current hook is only used in cases
    // where this feature flag is enabled, for simplicity we decided
    // to provide this informations next to the pageInteractions data
    const isConvertChatInstallSnippetEnabled = useFlag(
        FeatureFlagKey.ConvertChatInstallSnippet,
    )
    const data = useMemo(() => {
        if (!cubeData) {
            return null
        }

        return {
            pageInteractions: cubeData,
            isConvertChatInstallSnippetEnabled,
        }
    }, [cubeData, isConvertChatInstallSnippetEnabled])

    return {
        isLoading,
        data,
    }
}

export type PageInteractionsData = Exclude<
    Awaited<ReturnType<typeof useFetchPageInteractionsData>>['data'],
    null | undefined
>
