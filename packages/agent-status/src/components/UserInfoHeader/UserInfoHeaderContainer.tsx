import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    useGetCurrentUser,
    useGetUserAvailability,
} from '@gorgias/helpdesk-queries'

import {
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
            staleTime: Duration.minutes(5),
        },
    })

    const userAvailability = data?.data

    const statusExpirationTime = useUserAvailabilityExpirationTime(
        userAvailability?.custom_user_availability_status_expires_datetime,
    )

    const customUserStatus = useCustomUserUnavailabilityStatus(
        userAvailability?.custom_user_availability_status_id,
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

    const { firstname, lastname, email } = currentUser.data

    const userName = [firstname?.trim(), lastname?.trim()]
        .filter(Boolean)
        .join(' ')

    return (
        <UserInfoHeader
            user={currentUser.data}
            userName={userName || email || ''}
            statusText={displayStatusText}
        />
    )
}
