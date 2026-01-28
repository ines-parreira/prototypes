import React, { useCallback } from 'react'

import {
    useSelectableAgentAvailabilityStatuses,
    useUpdateUserAvailabilityStatus,
    useUserAvailability,
} from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import cn from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isGorgiasApiError } from 'models/api/types'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './UserMenu.less'

export default function StatusMenu() {
    const dispatch = useAppDispatch()
    const currentUserId = useAppSelector(getCurrentUserId)
    const { activeStatusId, isLoading: isLoadingAvailability } =
        useUserAvailability({ userId: currentUserId })
    const { allStatuses, isLoading: isLoadingStatuses } =
        useSelectableAgentAvailabilityStatuses()

    const { updateStatusAsync } = useUpdateUserAvailabilityStatus()

    const handleStatusUpdate = useCallback(
        async (statusId: string) => {
            try {
                await updateStatusAsync(currentUserId, statusId)

                logEvent(SegmentEvent.MenuUserLinkClicked, {
                    link: 'status-update',
                    status_id: statusId,
                })
            } catch (error) {
                void dispatch(
                    notify({
                        title: isGorgiasApiError(error)
                            ? error.response?.data.error.msg
                            : 'Failed to update status. Please try again.',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [updateStatusAsync, currentUserId, dispatch],
    )

    if (isLoadingStatuses || isLoadingAvailability) {
        return <div className={css['dropdown-item-user-menu']}>Loading...</div>
    }

    return (
        <>
            {allStatuses.map((statusItem) => (
                <button
                    key={statusItem.id}
                    className={cn(
                        css['dropdown-item-user-menu'],
                        css.justify,
                        activeStatusId === statusItem.id && css.selected,
                    )}
                    onClick={() => handleStatusUpdate(statusItem.id)}
                >
                    {statusItem.name}
                    {activeStatusId === statusItem.id && (
                        <span className={cn(css.check, 'material-icons')}>
                            done
                        </span>
                    )}
                </button>
            ))}
        </>
    )
}
