import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    useGetHelpCenterListMulti,
    useGetIngestionLogsList,
} from 'models/helpCenter/queries'
import { getShopUrlFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { notNull } from 'utils/types'

import type { IngestionLog } from '../AiAgentScrapedDomainContent/types'
import { useShopifyIntegrations } from '../Onboarding_V2/hooks/useShopifyIntegrations'

export const useStoresDomainIngestionLogs = ({
    storeNames,
    enabled = true,
}: {
    storeNames: string[]
    enabled?: boolean
}) => {
    const storeIntegrations = useShopifyIntegrations()

    const { data: snippetHelpCenters, isLoading: isGetHelpCenterListLoading } =
        useGetHelpCenterListMulti(
            storeNames.map((storeName) => ({
                shop_name: storeName,
                type: 'snippet',
                per_page: 1,
            })),
            {
                enabled: enabled && storeNames.length > 0,
                refetchOnWindowFocus: false,
            },
        )

    const getIngestionLogsListParams = useMemo(() => {
        const snippetHelpCenterIds =
            snippetHelpCenters
                ?.filter(notNull)
                .map((it) => it.data.data[0]?.id) ?? []

        return snippetHelpCenterIds.map((snippetHelpCenterId) => ({
            help_center_id: snippetHelpCenterId,
        }))
    }, [snippetHelpCenters])

    const {
        data: ingestionLogsList,
        error,
        isLoading: isIngestionLogsListLoading,
    } = useGetIngestionLogsList(getIngestionLogsListParams, {
        refetchOnWindowFocus: false,
        enabled: enabled && !!getIngestionLogsListParams.length,
    })

    const storesDomainIngestionLogs:
        | Record<string, IngestionLog[]>
        | undefined = useMemo(() => {
        if (isIngestionLogsListLoading || !ingestionLogsList?.length) {
            return undefined
        }

        return ingestionLogsList
            .flat(1)
            .reduce<
                Record<string, IngestionLog[]>
            >((acc, { helpCenterId, ingestionLogs }) => {
                if (!ingestionLogs?.length) {
                    return acc
                }

                const storeName =
                    snippetHelpCenters?.find(
                        (it) => it?.data.data[0].id === helpCenterId,
                    )?.data.data[0].shop_name ?? ''

                const storeIntegration = storeIntegrations.find(
                    (integration) => integration.meta.shop_name === storeName,
                )

                if (!storeIntegration) {
                    return acc
                }

                const storeUrl =
                    getShopUrlFromStoreIntegration(storeIntegration)

                const filteredLogs = ingestionLogs.filter(
                    ({ source, url }) =>
                        source === 'domain' && url === storeUrl,
                )

                acc[storeName] = filteredLogs

                return acc
            }, {})
    }, [
        ingestionLogsList,
        storeIntegrations,
        snippetHelpCenters,
        isIngestionLogsListLoading,
    ])

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during ingestion logs fetching',
                },
            })
        }
    }, [error])

    return {
        data: storesDomainIngestionLogs,
        isLoading: isIngestionLogsListLoading || isGetHelpCenterListLoading,
    }
}
