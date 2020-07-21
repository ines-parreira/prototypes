import {MAPPED_USER_ROLE} from '../user.js'

type AgentRoleMeta = {
    description: string
    label: string
}

export type MetaByAgentRole = {
    [key: string]: AgentRoleMeta
}

export type UserRole = keyof typeof MAPPED_USER_ROLE
