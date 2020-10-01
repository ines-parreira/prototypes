//@flow
import {MAPPED_USER_ROLE} from '../user.ts'

export type AgentRoleMeta = {
    description: string,
    label: string,
}

export type MetaByAgentRole = {
    [key: string]: AgentRoleMeta,
}

export type UserRole = $Keys<typeof MAPPED_USER_ROLE>
