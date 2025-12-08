import { UserRole } from './types/user'

/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const OBSERVER_AGENT_ROLE = UserRole.ObserverAgent
/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const LITE_AGENT_ROLE = UserRole.LiteAgent
/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const BASIC_AGENT_ROLE = UserRole.BasicAgent
/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const AGENT_ROLE = UserRole.Agent
/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const ADMIN_ROLE = UserRole.Admin
/**
 * @deprecated Use UserRole enum instead from @repo/utils package
 * @date 2025-11-18
 * @type permissions-migration
 */
export const GORGIAS_AGENT_ROLE = UserRole.GorgiasAgent

/**
 * @deprecated Use USER_ROLES_ORDERED_BY_PRIVILEGES from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export const USER_ROLES_ORDERED_BY_PRIVILEGES = Object.freeze([
    UserRole.ObserverAgent,
    UserRole.LiteAgent,
    UserRole.BasicAgent,
    UserRole.Agent,
    UserRole.Admin,
    UserRole.GorgiasAgent,
]) as UserRole[]

/**
 * @deprecated Use USER_ROLES from @repo/utils package instead
 * @date 2025-11-18
 * @type permissions-migration
 */
export const USER_ROLES = USER_ROLES_ORDERED_BY_PRIVILEGES

export const OBSERVER_AGENT_ROLE_META = Object.freeze({
    caption:
        'Can view customers and tickets, but cannot reply. Can send internal notes.',
    label: 'Observer',
})
export const LITE_AGENT_ROLE_META = Object.freeze({
    caption: 'Observer + can update customers and reply to customers.',
    label: 'Lite',
})
export const BASIC_AGENT_ROLE_META = Object.freeze({
    caption: 'Lite + can perform integrations actions (e.g. Shopify Refund).',
    label: 'Basic',
})
export const AGENT_ROLE_META = Object.freeze({
    caption:
        'Basic + can delete customers, tickets and ticket views, manage macros, rules and tags and view CSAT.',
    label: 'Lead',
})
export const ADMIN_ROLE_META = Object.freeze({
    caption:
        'Full access to the platform. Can manage users, settings and billing.',
    label: 'Admin',
})

export const ORDERED_ROLES_META_BY_USER_ROLE: Readonly<
    [
        UserRole,
        Readonly<{
            caption: string
            label: string
        }>,
    ][]
> = Object.freeze([
    [UserRole.ObserverAgent, OBSERVER_AGENT_ROLE_META],
    [UserRole.LiteAgent, LITE_AGENT_ROLE_META],
    [UserRole.BasicAgent, BASIC_AGENT_ROLE_META],
    [UserRole.Agent, AGENT_ROLE_META],
    [UserRole.Admin, ADMIN_ROLE_META],
])
