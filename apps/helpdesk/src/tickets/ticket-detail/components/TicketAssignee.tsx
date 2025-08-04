import cn from 'classnames'
import { Emoji } from 'emoji-mart'

import { TicketTeam, TicketUser } from '@gorgias/helpdesk-types'
import { Avatar } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { Avatar as NewAvatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'

import css from './TicketAssignee.less'

export function TicketAssignee({
    assignedAgent,
    assignedTeam,
}: {
    assignedAgent: TicketUser | null
    assignedTeam: TicketTeam | null
}) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const name =
        assignedAgent?.name || assignedAgent?.email || assignedTeam?.name

    const emoji = assignedTeam?.decoration?.emoji as string | undefined
    const avatarUrl = (assignedAgent?.meta as Record<string, unknown>)
        ?.profile_picture_url as string | undefined

    return (
        <div className={css.container}>
            {!assignedAgent && emoji ? (
                <span className={cn(css.avatar, css.emoji)}>
                    <Emoji emoji={emoji} size={20} />
                </span>
            ) : (
                name &&
                (hasTicketThreadRevamp ? (
                    <NewAvatar name={name} size="sm" url={avatarUrl} />
                ) : (
                    <Avatar
                        className={cn(css.avatar, {
                            [css.image]: avatarUrl,
                        })}
                        name={name}
                        shape="square"
                        size="sm"
                        url={avatarUrl}
                    />
                ))
            )}

            <span className={css.name}>{name || 'Unassigned'}</span>
        </div>
    )
}
