import { DurationInMs } from '@repo/utils'

import type { UserAvailability } from '@gorgias/helpdesk-queries'
import {
    useGetCurrentUser,
    useGetUserAvailability,
} from '@gorgias/helpdesk-queries'

import {
    useAvailabilityStatusColor,
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

    const userAvailability = data?.data as unknown as UserAvailability

    const statusText = useUserAvailabilityExpirationTime(
        userAvailability?.custom_user_availability_status_expires_datetime,
    )

    const indicatorColor = useAvailabilityStatusColor(
        userAvailability?.user_status,
        agentPhoneUnavailabilityStatus?.id,
    )

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
            statusText={
                agentPhoneUnavailabilityStatus
                    ? agentPhoneUnavailabilityStatus.name
                    : statusText
            }
            isOffline={false}
            indicatorColor={indicatorColor}
        />
    )
}
