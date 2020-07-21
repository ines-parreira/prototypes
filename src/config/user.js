//@flow
import type {AgentRoleMeta, MetaByAgentRole} from './types/user'

export const OBSERVER_AGENT_ROLE = 'observer-agent'
export const LITE_AGENT_ROLE = 'lite-agent'
export const BASIC_AGENT_ROLE = 'basic-agent'
export const AGENT_ROLE = 'agent'
export const ADMIN_ROLE = 'admin'
export const USER_ROLE = 'user'

export const MAPPED_USER_ROLE = Object.freeze({
    [OBSERVER_AGENT_ROLE]: OBSERVER_AGENT_ROLE,
    [LITE_AGENT_ROLE]: LITE_AGENT_ROLE,
    [BASIC_AGENT_ROLE]: BASIC_AGENT_ROLE,
    [AGENT_ROLE]: AGENT_ROLE,
    [ADMIN_ROLE]: ADMIN_ROLE,
})

export const USER_ROLES_ORDERED_BY_PRIVILEGES = Object.freeze([
    OBSERVER_AGENT_ROLE,
    LITE_AGENT_ROLE,
    BASIC_AGENT_ROLE,
    AGENT_ROLE,
    ADMIN_ROLE,
])

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
    [OBSERVER_AGENT_ROLE]: OBSERVER_AGENT_ROLE_META,
    [LITE_AGENT_ROLE]: LITE_AGENT_ROLE_META,
    [BASIC_AGENT_ROLE]: BASIC_AGENT_ROLE_META,
    [AGENT_ROLE]: AGENT_ROLE_META,
    [ADMIN_ROLE]: ADMIN_ROLE_META,
})
