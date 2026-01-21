import { Avatar, AvatarStatusIndicator, Box, Text } from '@gorgias/axiom'
import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import { useAvailabilityStatusColor } from '../../hooks'

export type UserInfoHeaderProps = {
    userName: string
    avatarUrl?: string
    statusText?: string
    status: UserAvailabilityStatus
    isOffline: boolean
}

export function UserInfoHeader({
    userName,
    avatarUrl,
    statusText,
    status,
    isOffline,
}: UserInfoHeaderProps) {
    const color = useAvailabilityStatusColor(status)
    return (
        <Box
            flexDirection="row"
            alignItems="center"
            gap="md"
            paddingTop="xs"
            paddingBottom="xs"
            paddingLeft="sm"
            paddingRight="sm"
        >
            <Box>
                <Avatar
                    name={userName}
                    url={avatarUrl}
                    statusSlot={
                        <AvatarStatusIndicator
                            size="xl"
                            color={color}
                            variant={isOffline ? 'secondary' : 'primary'}
                        />
                    }
                    size="lg"
                />
            </Box>
            <Box flexDirection="column" gap="xxxs">
                <Text variant="bold">{userName}</Text>
                {statusText && <Text size="sm">{statusText}</Text>}
            </Box>
        </Box>
    )
}
