import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'

import {
    useGetCurrentUser,
    useGetUserAvailability,
} from '@gorgias/helpdesk-queries'

import {
    useAvailabilityStatusColor,
    useCustomUserUnavailabilityStatus,
    useUserAvailabilityExpirationTime,
} from '../../hooks'
import type { AgentStatusWithSystem } from '../../types'
import { UserInfoHeader } from './UserInfoHeader'

export function UserInfoHeaderContainer({
    agentPhoneUnavailabilityStatus,
}: {
    agentPhoneUnavailabilityStatus?: AgentStatusWithSystem
}) {
    const { data: currentUser, isLoading } = useGetCurrentUser()
    const { data } = useGetUserAvailability(currentUser?.data.id!, {
        query: {
            enabled: !!currentUser?.data.id,
            staleTime: DurationInMs.FiveMinutes,
        },
    })

    const userAvailability = data?.data

    const statusExpirationTime = useUserAvailabilityExpirationTime(
        userAvailability?.custom_user_availability_status_expires_datetime,
    )

    const customUserStatus = useCustomUserUnavailabilityStatus(
        userAvailability?.custom_user_availability_status_id,
    )

    const indicatorColor = useAvailabilityStatusColor(
        userAvailability?.user_status,
        agentPhoneUnavailabilityStatus?.id,
    )

    const displayStatusText = useMemo(() => {
        if (agentPhoneUnavailabilityStatus) {
            return agentPhoneUnavailabilityStatus.name
        }

        if (customUserStatus) {
            return statusExpirationTime
                ? `${customUserStatus.name} until ${statusExpirationTime}`
                : customUserStatus.name
        }

        if (userAvailability) {
            switch (userAvailability.user_status) {
                case 'available':
                    return 'Available'
                case 'unavailable':
                    return 'Unavailable'
                default:
                    return undefined
            }
        }
    }, [
        agentPhoneUnavailabilityStatus,
        statusExpirationTime,
        customUserStatus,
        userAvailability,
    ])

    if (isLoading || !currentUser) {
        return null
    }

    const { firstname, lastname, meta, email } = currentUser.data

    const userName = [firstname?.trim(), lastname?.trim()]
        .filter(Boolean)
        .join(' ')

    const avatarUrl = meta?.profile_picture_url

    return (
        <UserInfoHeader
            userName={userName || email || ''}
            avatarUrl={avatarUrl ?? undefined}
            statusText={displayStatusText}
            isOffline={false}
            indicatorColor={indicatorColor}
        />
    )
}
