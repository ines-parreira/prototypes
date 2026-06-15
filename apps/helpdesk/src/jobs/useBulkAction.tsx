import { useCallback, useMemo } from 'react'

import type { AxiosError } from 'axios'

import { Button, toast } from '@gorgias/axiom'
import type { JobType } from '@gorgias/helpdesk-queries'
import { useCreateJob } from '@gorgias/helpdesk-queries'

import { getConfigByType } from 'config/views'
import { useAppSelector } from 'hooks/useAppSelector'
import type { View } from 'models/view/types'
import { getActiveView } from 'state/views/selectors'
import { getMoment } from 'utils/date'

import type { Update } from './types'
import { useCancelJob } from './useCancelJob'
import { useNotificationPayload } from './useNotificationPayload'

const useBulkAction = (level: 'ticket' | 'view', ticketIds?: number[]) => {
    const activeViewImmutable = useAppSelector(getActiveView)
    const activeView = useMemo(
        () =>
            activeViewImmutable.toJS() as View & {
                allItemsSelected?: boolean
                dirty?: boolean
                editMode?: boolean
            },
        [activeViewImmutable],
    )
    const viewConfig = getConfigByType(activeView.type)
    const objectType = useMemo(
        () =>
            ticketIds && ticketIds.length === 1
                ? (viewConfig.get('singular') as string)
                : (viewConfig.get('plural') as string),
        [ticketIds, viewConfig],
    )

    const { getNotificationParams, getNotificationPayload } =
        useNotificationPayload({
            level,
            objectType,
            ticketIds,
        })
    const { cancelJob } = useCancelJob({
        getNotificationPayload,
    })

    const { mutate, isLoading } = useCreateJob({
        mutation: {
            onSuccess: (response) => {
                const payload = getNotificationPayload()
                toast.success(payload.message ?? '', {
                    id: payload.id,
                    ...(level === 'view'
                        ? {
                              inlineActions: (
                                  <Button
                                      size="sm"
                                      variant="tertiary"
                                      onClick={() =>
                                          cancelJob({
                                              id: response.data.id!,
                                          })
                                      }
                                  >
                                      Cancel
                                  </Button>
                              ),
                          }
                        : {}),
                })
            },
            onError: (error: AxiosError<{ error: { msg: string } }>) => {
                const payload = getNotificationPayload()
                toast.error(
                    error.response?.status === 403
                        ? error.response?.data.error.msg
                        : `Failed to apply action on ${
                              viewConfig.get('plural') as string
                          } view. Please try again.`,
                    { id: payload.id },
                )
            },
        },
    })

    const createNotification = useCallback(
        (
            jobType: JobType,
            params?: {
                updates: XOR<Update>
            },
        ) => {
            const payload = getNotificationPayload(
                getNotificationParams(jobType, params),
            )
            toast(payload.message ?? '', { id: payload.id })
        },
        [getNotificationParams, getNotificationPayload],
    )

    if (level === 'view') {
        if (activeView.dirty) {
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const {
                id,
                allItemsSelected,
                dirty,
                editMode,
                shared_with_teams,
                shared_with_users,
                slug,
                uri,
                ...viewParam
            } = activeView
            /* eslint-enable @typescript-eslint/no-unused-vars */

            return {
                createJob: (
                    jobType: JobType,
                    params?: {
                        updates: XOR<Update>
                    },
                ) => {
                    createNotification(jobType, params)
                    return mutate({
                        data: {
                            params: {
                                view: viewParam,
                                ...params,
                            },
                            type: jobType,
                            scheduled_datetime: getMoment()
                                .add(15, 'second')
                                .toISOString(),
                        },
                    })
                },
                isLoading,
            }
        }

        return {
            createJob: (
                jobType: JobType,
                params?: {
                    updates: XOR<Update>
                },
            ) => {
                createNotification(jobType, params)
                return mutate({
                    data: {
                        params: {
                            view_id: activeView.id,
                            ...params,
                        },
                        type: jobType,
                        scheduled_datetime: getMoment()
                            .add(15, 'second')
                            .toISOString(),
                    },
                })
            },
            isLoading,
        }
    }

    return {
        createJob: (
            jobType: JobType,
            params?: {
                updates: XOR<Update>
            },
        ) => {
            createNotification(jobType, params)
            return mutate({
                data: {
                    params: {
                        ticket_ids: ticketIds,
                        ...params,
                    },
                    type: jobType,
                },
            })
        },
        isLoading,
    }
}

export { useBulkAction }
