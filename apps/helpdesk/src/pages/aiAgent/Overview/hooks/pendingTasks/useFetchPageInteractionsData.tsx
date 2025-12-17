import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import moment from 'moment'

import { usePostReporting } from 'domains/reporting/models/queries'
import { getPageInteractionsCountAfterDate } from 'domains/reporting/pages/convert/clients/PageInteractionsCubeQueries'
import type { CubeData } from 'domains/reporting/pages/convert/clients/types'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type Args = {
    storeName: string
    storeType: string
    refetchOnWindowFocus?: boolean
}
export const useFetchPageInteractionsData = ({
    storeName,
    storeType,
    refetchOnWindowFocus = true,
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

    const {
        isLoading,
        isFetched,
        data: cubeData,
    } = usePostReporting<[CubeData], CubeData>(query, { refetchOnWindowFocus })

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
        isFetched,
        data,
    }
}

export type PageInteractionsData = Exclude<
    Awaited<ReturnType<typeof useFetchPageInteractionsData>>['data'],
    null | undefined
>
