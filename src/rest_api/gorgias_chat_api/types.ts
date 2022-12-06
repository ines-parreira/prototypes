export type Agent = {
    avatarUrl: string | null
    name: string
}

export type AplicationAgentsResponse = {
    agents: Agent[]
    hasActiveAndAvailableAgents: boolean
    hasAvailableAgents: boolean
    isActive: boolean
}
