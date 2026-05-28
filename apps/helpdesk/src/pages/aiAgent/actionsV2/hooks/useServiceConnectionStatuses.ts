import { useEffect, useMemo, useRef } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useListServiceConnectionsByAppIds } from 'models/integration/queries'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

export type ServiceConnectionAppStatus = {
    isBroken: boolean
    brokenConnectionId?: string
}

export type ServiceConnectionStatuses = {
    byAppId: Partial<Record<string, ServiceConnectionAppStatus>>
    isError: boolean
    isLoading: boolean
}

const collectAppIds = (actions: StoreWorkflowsConfiguration[]): string[] => {
    const ids = new Set<string>()
    for (const action of actions) {
        for (const templateApp of action.apps ?? []) {
            if (templateApp.type === 'app') {
                ids.add(templateApp.app_id)
            }
        }
    }
    return [...ids]
}

export const useServiceConnectionStatuses = (
    actions: StoreWorkflowsConfiguration[],
): ServiceConnectionStatuses => {
    const sentryReportedRef = useRef(false)
    const appIds = useMemo(() => collectAppIds(actions), [actions])
    const queries = useListServiceConnectionsByAppIds(appIds)

    const isLoading = queries.some((query) => query.isInitialLoading)
    const isError = queries.some((query) => query.isError)
    const firstError = queries.find((query) => query.isError)?.error ?? null

    const byAppId: Partial<Record<string, ServiceConnectionAppStatus>> = {}
    appIds.forEach((appId, index) => {
        const query = queries[index]
        if (!query?.isSuccess) return
        const broken = query.data.find(
            (connection) => connection.status === 'invalid',
        )
        byAppId[appId] = {
            isBroken: !!broken,
            brokenConnectionId: broken?.id,
        }
    })

    useEffect(() => {
        if (isError && !sentryReportedRef.current) {
            sentryReportedRef.current = true
            reportError(firstError, {
                tags: {
                    team: SentryTeam.AI_AGENT,
                    feature: 'actions-library-v2',
                },
            })
        }
    }, [isError, firstError])

    return { byAppId, isError, isLoading }
}
