type AgentRoleMeta = {
    description: string
    label: string
}

export type MetaByAgentRole = {
    [key: string]: AgentRoleMeta
}

export enum UserRole {
    ObserverAgent = 'observer-agent',
    LiteAgent = 'lite-agent',
    BasicAgent = 'basic-agent',
    Agent = 'agent',
    Admin = 'admin',
}

export type UserDraft = {
    id?: Maybe<number>
    email: string
    name: string
    roles: {name: UserRole}[]
}

export type User = UserDraft & {
    active: boolean
    bio: Maybe<string>
    created_datetime: string
    data: Maybe<unknown>
    deactivated_datetime: Maybe<string>
    external_id: string
    firstname: string
    id: number
    lastname: string
    meta: MetaByAgentRole
    updated_datetime: string
    roles: {id: number; name: UserRole}[]
}
