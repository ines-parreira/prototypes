import React, { useCallback } from 'react'

import { useSelectableAgentAvailabilityStatuses } from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import {
    getActiveStatusId,
    useUpdateUserAvailability,
    useUserAvailability,
} from '@repo/users'
import cn from 'classnames'

import { toast } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { isGorgiasApiError } from 'models/api/types'
import { getCurrentUserId } from 'state/currentUser/selectors'

import css from './UserMenu.less'

export function StatusMenu({
    onUpdateStatusStart,
}: {
    onUpdateStatusStart: () => void
}) {
    const currentUserId = useAppSelector(getCurrentUserId)
    const availability = useUserAvailability(currentUserId)
    const { allStatuses, isLoading: isLoadingStatuses } =
        useSelectableAgentAvailabilityStatuses()

    const { update } = useUpdateUserAvailability(currentUserId)

    const activeStatusId = getActiveStatusId(availability)

    const handleStatusUpdate = useCallback(
        async (statusId: string) => {
            try {
                onUpdateStatusStart()
                await (statusId === 'available' || statusId === 'unavailable'
                    ? update(statusId)
                    : update('custom', statusId))
                logEvent(SegmentEvent.MenuUserLinkClicked, {
                    link: 'status-update',
                    status_id: statusId,
                })
            } catch (error) {
                toast.error(
                    isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Failed to update status. Please try again.',
                )
            }
        },
        [update, onUpdateStatusStart],
    )

    if (isLoadingStatuses) {
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
