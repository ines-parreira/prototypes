import { useCallback } from 'react'

import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

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
import type { TicketCachePatch } from '../../utils/optimisticUpdates/viewListCache'

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
            successMessage?: string,
            listCachePatch?: TicketCachePatch,
        ) => {
            let snapshot: [QueryKey, unknown][] = []

            if (listCachePatch) {
                const queryKey = hasSelectedAll
                    ? [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId]
                    : LIST_VIEW_ITEMS_QUERY_KEY_PREFIX

                snapshot = queryClient.getQueriesData({ queryKey })

                if (hasSelectedAll) {
                    patchAllTicketsInViewListCache(
                        queryClient,
                        viewId,
                        listCachePatch,
                    )
                } else {
                    ticketIds.forEach((ticketId) => {
                        patchTicketInViewListCache(
                            queryClient,
                            ticketId,
                            listCachePatch,
                        )
                    })
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
            const queryKey = hasSelectedAll
                ? [...LIST_VIEW_ITEMS_QUERY_KEY_PREFIX, viewId]
                : LIST_VIEW_ITEMS_QUERY_KEY_PREFIX
            const snapshot = queryClient.getQueriesData({ queryKey })

            if (hasSelectedAll) {
                removeAllTicketsFromViewListCache(queryClient, viewId)
            } else {
                ticketIds.forEach((ticketId) => {
                    removeTicketFromViewListCache(queryClient, ticketId)
                })
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
