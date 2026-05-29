import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { UserAvatar } from '@repo/users'

import { Box, Text } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import css from './UserInfoHeader.less'

export type UserInfoHeaderProps = {
    user: User
    userName: string
    statusText?: string
}

export function UserInfoHeader({
    user,
    userName,
    statusText,
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
                    <UserAvatar user={user} size="sm" />
                </Box>
                <Box flexDirection="column" gap="xxxxs" minWidth={0}>
                    <Text overflow="ellipsis">{userName}</Text>
                    <div className={css.textStack}>
                        {statusText && (
                            <Text
                                className={css.statusText}
                                overflow="ellipsis"
                                size="sm"
                            >
                                {statusText}
                            </Text>
                        )}
                        <Text
                            className={css.viewProfile}
                            overflow="ellipsis"
                            size="sm"
                        >
                            View profile
                        </Text>
                    </div>
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
                <UserAvatar user={user} size="lg" />
            </Box>
            <Box flexDirection="column" gap="xxxs">
                <Text variant="bold">{userName}</Text>
                {statusText && <Text size="sm">{statusText}</Text>}
            </Box>
        </Box>
    )
}
