import type { ComponentProps } from 'react'

import { UserRole } from '@repo/permissions'

import { Tag } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { isAccountOwner } from '../utils/isAccountOwner'

type TagColor = ComponentProps<typeof Tag>['color']

export const ROLE_CONFIG: Record<UserRole, { label: string; color: TagColor }> =
    {
        [UserRole.Admin]: { label: 'Admin', color: 'red' },
        [UserRole.Agent]: { label: 'Lead', color: 'orange' },
        [UserRole.BasicAgent]: { label: 'Basic', color: 'teal' },
        [UserRole.LiteAgent]: { label: 'Lite', color: 'purple' },
        [UserRole.ObserverAgent]: { label: 'Observer', color: 'grey' },
        [UserRole.Bot]: { label: 'Bot', color: 'blue' },
        [UserRole.GorgiasAgent]: {
            label: 'Gorgias Support',
            color: 'blue',
        },
    }

type UserRoleTagProps = {
    user: User
}

export function UserRoleTag({ user }: UserRoleTagProps) {
    if (isAccountOwner(user)) {
        return <Tag color="blue">Account Owner</Tag>
    }

    const role = user.role?.name
    if (!role) return null
    if (!(role in ROLE_CONFIG)) return <Tag>{role}</Tag>

    const config = ROLE_CONFIG[role as UserRole]
    return <Tag color={config.color}>{config.label}</Tag>
}
