import { useCallback } from 'react'

import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { useCreateJob } from '@gorgias/helpdesk-queries'
import type {
    CreateJobBodyParamsUpdates,
    JobType,
} from '@gorgias/helpdesk-types'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'
import { NotificationStatus } from '../../utils/LegacyBridge/context'
import {
    LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
    patchAllTicketsInViewListCache,
    patchTicketInViewListCache,
    removeAllTicketsFromViewListCache,
    removeTicketFromViewListCache,
} from '../../utils/optimisticUpdates/viewListCache'

type Props = {
    viewId: number
    ticketIds: number[]
    hasSelectedAll: boolean
}

type JobTypeValue = (typeof JobType)[keyof typeof JobType]

export function useBulkJobAction({ viewId, ticketIds, hasSelectedAll }: Props) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const queryClient = useQueryClient()

    const { mutateAsync, isLoading } = useCreateJob()

    const runJob = useCallback(
        async (type: JobTypeValue, updates?: CreateJobBodyParamsUpdates) => {
            const params = hasSelectedAll
                ? { view_id: viewId, ...(updates ? { updates } : {}) }
                : { ticket_ids: ticketIds, ...(updates ? { updates } : {}) }

            await mutateAsync({
                data: { type, params },
            })
        },
        [hasSelectedAll, mutateAsync, ticketIds, viewId],
    )

    const createJob = useCallback(
        async (
            type: JobTypeValue,
            updates?: CreateJobBodyParamsUpdates,
            cachePatch?: Partial<Ticket>,
            successMessage?: string,
        ) => {
            let snapshot: [QueryKey, unknown][] = []

            if (cachePatch) {
                // Prevent polling/refetches from overwriting optimistic updates mid-flight
                if (hasSelectedAll) {
                    await queryClient.cancelQueries({
                        queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId],
                    })
                    snapshot = queryClient.getQueriesData({
                        queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId],
                    })
                    patchAllTicketsInViewListCache(
                        queryClient,
                        viewId,
                        cachePatch,
                    )
                } else {
                    await queryClient.cancelQueries({
                        queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
                    })
                    snapshot = queryClient.getQueriesData({
                        queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
                    })
                    ticketIds.forEach((id) =>
                        patchTicketInViewListCache(queryClient, id, cachePatch),
                    )
                }
            }

            try {
                await runJob(type, updates)

                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: successMessage ?? 'Action applied successfully',
                })
            } catch {
                snapshot.forEach(([key, data]) =>
                    queryClient.setQueryData(key, data),
                )
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to apply action. Please try again.',
                })
            }
        },
        [
            dispatchNotification,
            hasSelectedAll,
            queryClient,
            runJob,
            ticketIds,
            viewId,
        ],
    )

    const createJobRemovingTickets = useCallback(
        async (
            type: JobTypeValue,
            updates?: CreateJobBodyParamsUpdates,
            successMessage?: string,
        ) => {
            let snapshot: [QueryKey, unknown][] = []

            // Removing always changes list caches, so we always snapshot + cancel.
            if (hasSelectedAll) {
                await queryClient.cancelQueries({
                    queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId],
                })
                snapshot = queryClient.getQueriesData({
                    queryKey: [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId],
                })
                removeAllTicketsFromViewListCache(queryClient, viewId)
            } else {
                await queryClient.cancelQueries({
                    queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
                })
                snapshot = queryClient.getQueriesData({
                    queryKey: LIST_VIEW_ITEMS_QUERY_KEY_PREFIX,
                })
                ticketIds.forEach((id) =>
                    removeTicketFromViewListCache(queryClient, id),
                )
            }

            try {
                await runJob(type, updates)

                dispatchNotification({
                    status: NotificationStatus.Success,
                    message: successMessage ?? 'Action applied successfully',
                })
            } catch {
                snapshot.forEach(([key, data]) =>
                    queryClient.setQueryData(key, data),
                )
                dispatchNotification({
                    status: NotificationStatus.Error,
                    message: 'Failed to apply action. Please try again.',
                })
            }
        },
        [
            dispatchNotification,
            hasSelectedAll,
            queryClient,
            runJob,
            ticketIds,
            viewId,
        ],
    )

    return { createJob, createJobRemovingTickets, isLoading }
}
