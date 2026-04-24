import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'

import type { AvatarStatusIndicatorColor } from '@gorgias/axiom'
import { Avatar, AvatarStatusIndicator, Box, Text } from '@gorgias/axiom'

import css from './UserInfoHeader.less'

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
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    if (hasWayfindingMS1Flag) {
        return (
            <Box
                className={css.container}
                flexDirection="row"
                alignItems="center"
                gap="xs"
            >
                <Box>
                    <Avatar
                        name={userName}
                        url={avatarUrl}
                        status={
                            indicatorColor && (
                                <AvatarStatusIndicator
                                    color={indicatorColor}
                                    variant={
                                        isOffline ? 'secondary' : 'primary'
                                    }
                                />
                            )
                        }
                        size="sm"
                    />
                </Box>
                <Box flexDirection="column" gap="xxxxs">
                    <Text>{userName}</Text>
                    {statusText && (
                        <Text className={css.statusText} size="sm">
                            {statusText}
                        </Text>
                    )}
                    <Text className={css.viewProfile} size="sm">
                        View profile
                    </Text>
                </Box>
            </Box>
        )
    }
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
