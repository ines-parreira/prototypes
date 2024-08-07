import {useCallback, useMemo} from 'react'
import {JobType, useCreateJob} from '@gorgias/api-queries'
import {notify as updateNotification} from 'reapop'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'
import {AxiosError} from 'axios'

import {getConfigByType} from 'config/views'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {View} from 'models/view/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getActiveView} from 'state/views/selectors'
import {getMoment} from 'utils/date'

import {Update} from './types'
import useCancelJob from './useCancelJob'
import useNotificationPayload from './useNotificationPayload'

const useBulkAction = (level: 'ticket' | 'view', ticketIds?: number[]) => {
    const dispatch = useAppDispatch()
    const activeViewImmutable = useAppSelector(getActiveView)
    const activeView = useMemo(
        () =>
            activeViewImmutable.toJS() as View & {
                allItemsSelected?: boolean
                dirty?: boolean
                editMode?: boolean
            },
        [activeViewImmutable]
    )
    const viewConfig = getConfigByType(activeView.type)
    const objectType = useMemo(
        () => viewConfig.get('plural') as string,
        [viewConfig]
    )

    const {getNotificationParams, getNotificationPayload} =
        useNotificationPayload({
            level,
            objectType,
            ticketIds,
        })
    const {cancelJob} = useCancelJob({
        getNotificationPayload,
    })

    const {mutateAsync, isLoading} = useCreateJob({
        mutation: {
            onSuccess: (response) => {
                dispatch(
                    updateNotification({
                        ...getNotificationPayload(),
                        status: NotificationStatus.Success,
                        ...(level === 'view'
                            ? {
                                  buttons: [
                                      {
                                          name: 'Cancel',
                                          primary: true,
                                          onClick: () => {
                                              cancelJob({id: response.data.id!})
                                          },
                                      },
                                  ],
                              }
                            : {}),
                    })
                )
            },
            onError: (error: AxiosError<{error: {msg: string}}>) => {
                dispatch(
                    updateNotification({
                        ...getNotificationPayload(),
                        status: NotificationStatus.Error,
                        message:
                            error.response?.status === 403
                                ? error.response?.data.error.msg
                                : `Failed to apply action on ${
                                      viewConfig.get('plural') as string
                                  } view. Please try again.`,
                    })
                )
            },
        },
    })

    const createNotification = useCallback(
        (
            jobType: JobType,
            params?: {
                updates: XOR<Update>
            }
        ) => {
            dispatch(
                notify(
                    getNotificationPayload(
                        getNotificationParams(jobType, params)
                    )
                )
            ) as unknown as UpsertNotificationAction
        },
        [dispatch, getNotificationParams, getNotificationPayload]
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
                    }
                ) => {
                    createNotification(jobType, params)
                    return mutateAsync({
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
                }
            ) => {
                createNotification(jobType, params)
                return mutateAsync({
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
            }
        ) => {
            createNotification(jobType, params)
            return mutateAsync({
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

export default useBulkAction
