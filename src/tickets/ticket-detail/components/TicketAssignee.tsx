import cn from 'classnames'
import { Emoji } from 'emoji-mart'

import { TicketAssigneeTeam, TicketAssigneeUser } from '@gorgias/helpdesk-types'
import { Avatar } from '@gorgias/merchant-ui-kit'

import css from './TicketAssignee.less'

export function TicketAssignee({
    assignedAgent,
    assignedTeam,
}: {
    assignedAgent: TicketAssigneeUser
    assignedTeam: TicketAssigneeTeam
}) {
    const name =
        assignedAgent?.name || assignedAgent?.email || assignedTeam?.name

    const emoji = assignedTeam?.decoration?.emoji as string | undefined

    return (
        <div className={css.container}>
            {!assignedAgent && emoji ? (
                <span className={cn(css.avatar, css.emoji)}>
                    <Emoji emoji={emoji} size={20} />
                </span>
            ) : (
                name && (
                    <Avatar
                        className={css.avatar}
                        name={name}
                        shape="square"
                        size="sm"
                        url={
                            (assignedAgent?.meta as Record<string, unknown>)
                                ?.profile_picture_url as string | undefined
                        }
                    />
                )
            )}

            <span className={css.name}>{name || 'Unassigned'}</span>
        </div>
    )
}
