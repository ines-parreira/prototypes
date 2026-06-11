import { useCallback } from 'react'

import {
    formatDuration,
    useAgentPhoneStatus,
    useCustomAgentUnavailableStatusesFlag,
    useSelectableAgentAvailabilityStatuses,
} from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import {
    getActiveStatusId,
    useUpdateUserAvailability,
    useUserAvailability,
} from '@repo/users'

import { Dot, MenuItem, SubMenu, Text, toast } from '@gorgias/axiom'

import { AvailabilityToggle } from 'common/navigation/components/AvailabilityToggle'
import { isGorgiasApiError } from 'models/api/types'

interface UserMenuStatusSubMenuProps {
    userId: number
}

export function UserMenuStatusSubMenu({ userId }: UserMenuStatusSubMenuProps) {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const { isOnActiveCall } = useAgentPhoneStatus({
        userId,
        refetchOnMount: 'always',
    })
    const availability = useUserAvailability(userId)
    const { allStatuses, isLoading: isLoadingStatuses } =
        useSelectableAgentAvailabilityStatuses()
    const { update } = useUpdateUserAvailability(userId)

    const activeStatusId = getActiveStatusId(availability)

    const canChangeStatus = isAgentUnavailabilityEnabled && !isOnActiveCall

    const handleStatusUpdate = useCallback(
        async (statusId: string) => {
            try {
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
        [update],
    )

    if (!isAgentUnavailabilityEnabled) {
        return (
            <MenuItem asSlot>
                <AvailabilityToggle />
            </MenuItem>
        )
    }

    return (
        <SubMenu
            id="status-submenu"
            label="Status"
            isDisabled={!canChangeStatus}
            selectedKeys={activeStatusId ? [activeStatusId] : []}
            selectionMode="single"
        >
            {isLoadingStatuses ? (
                <MenuItem id="loading" label="Loading..." isDisabled />
            ) : (
                allStatuses.map((statusItem) => (
                    <MenuItem
                        key={statusItem.id}
                        id={statusItem.id}
                        label={
                            !statusItem.is_system &&
                            statusItem.duration_unit !== null &&
                            statusItem.duration_value !== null ? (
                                <>
                                    {`${statusItem.name} - `}
                                    <Text color="content-neutral-secondary">
                                        {formatDuration(
                                            statusItem.duration_unit,
                                            statusItem.duration_value,
                                        )}
                                    </Text>
                                </>
                            ) : (
                                statusItem.name
                            )
                        }
                        onAction={() => {
                            void handleStatusUpdate(statusItem.id)
                        }}
                        leadingSlot={
                            <Dot
                                color={
                                    statusItem.id === 'available'
                                        ? 'green'
                                        : 'orange'
                                }
                            />
                        }
                    />
                ))
            )}
        </SubMenu>
    )
}
