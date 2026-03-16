import type { AvatarStatusIndicatorColor } from '@gorgias/axiom'
import { Avatar, AvatarStatusIndicator, Box, Text } from '@gorgias/axiom'

export type UserInfoHeaderProps = {
    userName: string
    avatarUrl?: string
    statusText?: string
    isOffline?: boolean
    indicatorColor?: AvatarStatusIndicatorColor
}

export function UserInfoHeader({
    userName,
    avatarUrl,
    statusText,
    isOffline,
    indicatorColor,
}: UserInfoHeaderProps) {
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
                    status={
                        indicatorColor && (
                            <AvatarStatusIndicator
                                color={indicatorColor}
                                variant={isOffline ? 'secondary' : 'primary'}
                            />
                        )
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
