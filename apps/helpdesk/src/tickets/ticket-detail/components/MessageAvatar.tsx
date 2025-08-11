import { useEffect, useState } from 'react'

import cn from 'classnames'

import { Avatar } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import {
    getAvatar,
    getAvatarFromCache,
} from 'pages/common/components/Avatar/utils'
import { Avatar as NewAvatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'

import css from './MessageAvatar.less'

export const AVATAR_SIZE = 36

type Props = {
    message: TicketMessage
    isAI?: boolean
    isFailed?: boolean
}

export function MessageAvatar({
    message,
    isAI = false,
    isFailed = false,
}: Props) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const isMessageDuplicated = Boolean(
        ((message.meta ?? {}) as Record<string, unknown>).is_duplicated,
    )

    const email = message.from_agent ? null : message.sender?.email

    const priorityUrl =
        ((((message.sender?.meta ?? {}) as Record<string, unknown>)
            .profile_picture_url ?? '') as string) ||
        getAvatarFromCache(email, AVATAR_SIZE)

    const [imageUrl, setImageUrl] = useState(priorityUrl)

    useEffect(() => {
        if (priorityUrl) {
            setImageUrl(priorityUrl)
            return
        }

        if (email) {
            void getAvatar({
                email,
                size: AVATAR_SIZE,
            }).then((imageUrl: Maybe<string>) => {
                setImageUrl(imageUrl)
            })
        }
    }, [email, priorityUrl])

    const isMessageDeleted = isTicketMessageDeleted(message)
    const isMessageHidden = isTicketMessageHidden(message)

    if (
        (isMessageHidden && !isMessageDuplicated) ||
        (!isMessageHidden && isMessageDeleted)
    ) {
        return null
    }

    return hasTicketThreadRevamp ? (
        <NewAvatar
            isAgent={message.from_agent}
            isAIAgent={isAI}
            name={message.sender.name ?? ''}
            url={imageUrl ?? undefined}
            userId={message.sender.id ?? undefined}
        />
    ) : (
        <Avatar
            name={message.sender.name ?? ''}
            url={imageUrl ?? undefined}
            icon={
                isAI ? (
                    <i className={cn('material-icons', css.aiIcon)}>
                        auto_awesome
                    </i>
                ) : undefined
            }
            size="md"
            shape="square"
            className={cn(css.avatar, {
                [css.ai]: isAI,
                [css.failed]: isFailed,
                [css.image]: imageUrl,
            })}
        />
    )
}
