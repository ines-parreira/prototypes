import { useEffect, useRef } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useListTrackstarConnections } from 'models/workflows/queries'
import type { TrackstarConnection } from 'pages/automate/workflows/types'

export type ServiceConnectionStatus = {
    integrationName: TrackstarConnection['integration_name']
    isFailed: boolean
    connectionId: string
}

export type ServiceConnectionsResult = {
    byIntegration: Partial<
        Record<TrackstarConnection['integration_name'], ServiceConnectionStatus>
    >
    isError: boolean
    isLoading: boolean
}

export const useServiceConnections = ({
    storeName,
    storeType,
}: {
    storeName: string
    storeType: string
}): ServiceConnectionsResult => {
    const sentryReportedRef = useRef(false)

    const { data, isError, isInitialLoading, error } =
        useListTrackstarConnections<
            Partial<
                Record<
                    TrackstarConnection['integration_name'],
                    ServiceConnectionStatus
                >
            >
        >(
            { storeName, storeType },
            {
                select: (connections) =>
                    connections.reduce<
                        Partial<
                            Record<
                                TrackstarConnection['integration_name'],
                                ServiceConnectionStatus
                            >
                        >
                    >((acc, connection) => {
                        acc[connection.integration_name] = {
                            integrationName: connection.integration_name,
                            isFailed: connection.error,
                            connectionId: connection.connection_id,
                        }
                        return acc
                    }, {}),
                retry: 1,
            },
        )

    useEffect(() => {
        if (isError && !sentryReportedRef.current) {
            sentryReportedRef.current = true
            reportError(error, {
                tags: {
                    team: SentryTeam.AI_AGENT,
                    feature: 'actions-library-v2',
                },
            })
        }
    }, [isError, error])

    return {
        byIntegration: data ?? {},
        isError,
        isLoading: isInitialLoading,
    }
}
