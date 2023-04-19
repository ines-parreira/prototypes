export type Translations = {
    texts: Record<string, string>
    sspTexts: Record<string, string>
}

export type Texts = {
    texts: Record<string, string>
    sspTexts: Record<string, string>
}

export type InstallationStatus = {
    applicationId: number
    hasBeenRequestedOnce: boolean
    installed: boolean
}

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
