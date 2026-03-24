import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetKnowledgeStatus } from 'models/helpCenter/queries'

import type { KnowledgeStatus } from '../AiAgentScrapedDomainContent/types'

export const useStoresKnowledgeStatus = ({
    enabled = true,
}: {
    enabled?: boolean
}) => {
    const {
        data: knowledgeStatus,
        error,
        isInitialLoading: isKnowledgeStatusLoading,
    } = useGetKnowledgeStatus({
        refetchOnWindowFocus: false,
        enabled,
    })

    const storesKnowledgeStatus: Record<string, KnowledgeStatus> | undefined =
        useMemo(() => {
            if (isKnowledgeStatusLoading || !knowledgeStatus?.length) {
                return undefined
            }

            return knowledgeStatus
                .flat(1)
                .reduce<
                    Record<string, KnowledgeStatus>
                >((acc, knowledgeStatus) => {
                    // This should not happen, but there has been some cases where
                    // multiple snippet help centers were created for the same store.
                    // So we only use the first one just in case.
                    if (!!acc[knowledgeStatus.shop_name]) {
                        return acc
                    }

                    acc[knowledgeStatus.shop_name] = knowledgeStatus

                    return acc
                }, {})
        }, [knowledgeStatus, isKnowledgeStatusLoading])

    useEffect(() => {
        if (error) {
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                extra: {
                    context: 'Error during knowledge status fetching',
                },
            })
        }
    }, [error])

    return {
        data: storesKnowledgeStatus,
        isLoading: isKnowledgeStatusLoading,
    }
}
