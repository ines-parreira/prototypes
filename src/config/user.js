export const OBSERVER_AGENT_ROLE = 'observer-agent'
export const LITE_AGENT_ROLE = 'lite-agent'
export const BASIC_AGENT_ROLE = 'basic-agent'
export const AGENT_ROLE = 'agent'
export const ADMIN_ROLE = 'admin'
export const STAFF_ROLE = 'staff'
export const USER_ROLE = 'user'

export const USER_ROLES_ORDERED_BY_PRIVILEGES = Object.freeze([
    OBSERVER_AGENT_ROLE,
    LITE_AGENT_ROLE,
    BASIC_AGENT_ROLE,
    AGENT_ROLE,
    ADMIN_ROLE,
    STAFF_ROLE
])

export const USER_ROLES = USER_ROLES_ORDERED_BY_PRIVILEGES
