import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    useGetArticleIngestionLogsList,
    useGetHelpCenterListMulti,
} from 'models/helpCenter/queries'
import type { SourceItem } from 'pages/aiAgent/components/PublicSourcesSection/types'
import { notNull } from 'utils/types'

import { mapArticleIngestionLogsToSourceItem } from '../components/PublicSourcesSection/utils'

export const usePublicResourcesList = ({
    shopNames,
    enabled = true,
}: {
    shopNames: string[]
    enabled?: boolean
}) => {
    const { data: snippetHelpCenters, isLoading: isGetHelpCenterListLoading } =
        useGetHelpCenterListMulti(
            shopNames.map((shopName) => ({
                shop_name: shopName,
                type: 'snippet',
                per_page: 1,
            })),
            {
                refetchOnWindowFocus: false,
                enabled: enabled,
            },
        )

    const getArticleIngestionLogsListParams = useMemo(() => {
        const snippetHelpCenterIds =
            snippetHelpCenters
                ?.filter(notNull)
                .map((it) => it.data.data[0]?.id) ?? []

        return snippetHelpCenterIds.map((snippetHelpCenterId) => ({
            help_center_id: snippetHelpCenterId,
        }))
    }, [snippetHelpCenters])

    const {
        data: articleIngestionLogs,
        error,
        isLoading: isSourceItemsListLoading,
    } = useGetArticleIngestionLogsList(getArticleIngestionLogsListParams, {
        refetchOnWindowFocus: false,
        enabled: !!getArticleIngestionLogsListParams.length && enabled,
    })

    const sourceItems: Record<string, SourceItem[]> | undefined =
        useMemo(() => {
            if (isSourceItemsListLoading || !snippetHelpCenters?.length) {
                return undefined
            }

            return articleIngestionLogs
                ?.flat(1)
                .reduce<
                    Record<string, SourceItem[]>
                >((acc, { ingestionLogs, helpCenterId }) => {
                    const sourceItems = (
                        ingestionLogs?.map(
                            mapArticleIngestionLogsToSourceItem,
                        ) ?? []
                    ).sort((a, b) =>
                        a.createdDatetime < b.createdDatetime ? -1 : 1,
                    )

                    const storeName =
                        snippetHelpCenters.find(
                            (it) => it?.data.data[0].id === helpCenterId,
                        )?.data.data[0].shop_name ?? ''

                    acc[storeName] = sourceItems
                    return acc
                }, {})
        }, [articleIngestionLogs, isSourceItemsListLoading, snippetHelpCenters])

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during article ingestion logs fetching',
                },
            })
        }
    }, [error])

    return {
        sourceItems,
        isLoading: isSourceItemsListLoading || isGetHelpCenterListLoading,
    }
}
