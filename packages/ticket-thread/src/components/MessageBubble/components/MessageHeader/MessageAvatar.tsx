import { Avatar } from '@gorgias/axiom'
import type { TicketMessageUserOrCustomer } from '@gorgias/helpdesk-types'

import css from './MessageAvatar.less'

export type MessageAvatarProps = {
    sender: TicketMessageUserOrCustomer
}

export function MessageAvatar({ sender }: MessageAvatarProps) {
    const name = sender.name ?? sender.email ?? '??'
    const url =
        (sender.meta as { profile_picture_url?: string } | null)
            ?.profile_picture_url ?? ''

    return (
        <Avatar className={css.messageAvatar} name={name} size="md" url={url} />
    )
}
