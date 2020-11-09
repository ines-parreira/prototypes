import {AgentRoleMeta, MetaByAgentRole, UserRole} from './types/user'

//$TsFixMe fallback values, use UserRole enum instead
export const OBSERVER_AGENT_ROLE = UserRole.ObserverAgent
export const LITE_AGENT_ROLE = UserRole.LiteAgent
export const BASIC_AGENT_ROLE = UserRole.BasicAgent
export const AGENT_ROLE = UserRole.Agent
export const ADMIN_ROLE = UserRole.Admin
export const MAPPED_USER_ROLE = Object.freeze({
    [UserRole.ObserverAgent]: UserRole.ObserverAgent,
    [UserRole.LiteAgent]: UserRole.LiteAgent,
    [UserRole.BasicAgent]: UserRole.BasicAgent,
    [UserRole.Agent]: UserRole.Agent,
    [UserRole.Admin]: UserRole.Admin,
})

export const USER_ROLE = 'user'

export const USER_ROLES_ORDERED_BY_PRIVILEGES = Object.freeze([
    UserRole.ObserverAgent,
    UserRole.LiteAgent,
    UserRole.BasicAgent,
    UserRole.Agent,
    UserRole.Admin,
]) as UserRole[]

export const USER_ROLES = USER_ROLES_ORDERED_BY_PRIVILEGES

export const OBSERVER_AGENT_ROLE_META: AgentRoleMeta = Object.freeze({
    description: 'Able to view customers, tickets and send internal notes.',
    label: 'Observer agent',
})
export const LITE_AGENT_ROLE_META: AgentRoleMeta = Object.freeze({
    description: 'Able to modify customers, tickets and send messages.',
    label: 'Lite agent',
})
export const BASIC_AGENT_ROLE_META: AgentRoleMeta = Object.freeze({
    description:
        'Able to modify customers, tickets, send messages and perform integrations-related actions.',
    label: 'Basic agent',
})
export const AGENT_ROLE_META: AgentRoleMeta = Object.freeze({
    description:
        'Able to manage customers, tickets, tags, send messages and perform integrations-related actions.',
    label: 'Lead agent',
})
export const ADMIN_ROLE_META: AgentRoleMeta = Object.freeze({
    description:
        'Able to manage everything. (billing info, users, integrations, rules, tickets, customers, etc...)',
    label: 'Admin agent',
})

export const ORDERED_ROLES_META_BY_USER_ROLE: MetaByAgentRole = Object.freeze({
    [UserRole.ObserverAgent]: OBSERVER_AGENT_ROLE_META,
    [UserRole.LiteAgent]: LITE_AGENT_ROLE_META,
    [UserRole.BasicAgent]: BASIC_AGENT_ROLE_META,
    [UserRole.Agent]: AGENT_ROLE_META,
    [UserRole.Admin]: ADMIN_ROLE_META,
})
