import { useRef } from 'react'
import type { ComponentProps } from 'react'

import cn from 'classnames'

import {
    LegacyTooltip as Tooltip,
    LegacyAvatar as UIKitAvatar,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUserId } from 'state/currentUser/selectors'

import css from './Avatar.less'

type UIKitAvatarProps = ComponentProps<typeof UIKitAvatar>

type Props = UIKitAvatarProps & {
    isAgent?: boolean
    isAIAgent?: boolean
    tooltip?: string
    userId?: number
}

export function Avatar({
    isAgent = false,
    isAIAgent = false,
    tooltip,
    userId,
    ...props
}: Props) {
    const ref = useRef<HTMLDivElement | null>(null)
    const currentUserId = useAppSelector(getCurrentUserId)
    const isCurrentUser = currentUserId === userId

    const icon = isAIAgent ? (
        <span className={cn('material-icons-round', css.icon)}>
            auto_awesome
        </span>
    ) : undefined

    const avatar = (
        <UIKitAvatar
            {...props}
            className={cn(css.avatar, {
                [css.isAgent]: isAgent,
                [css.isAIAgent]: isAIAgent,
                [css.isCurrentUser]: isCurrentUser,
            })}
            icon={icon}
        />
    )

    if (!tooltip) return avatar

    return (
        <>
            <div ref={ref}>{avatar}</div>
            <Tooltip target={ref} placement="bottom">
                {tooltip}
            </Tooltip>
        </>
    )
}
