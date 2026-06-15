import type { Suggestion } from '@gorgias/copilot'

export type ConversationStarter = Omit<Suggestion, 'isLoading'>

const UNIVERSAL_STARTER: ConversationStarter = {
    title: 'Optimize my AI Agent setup',
    message: 'Optimize my AI Agent setup',
}

const SKILLS_LIST_STARTER: ConversationStarter = {
    title: 'Audit my skills and tell me which ones to improve',
    message: 'Audit my skills and tell me which ones to improve',
}

const SKILL_DETAIL_IMPROVE_STARTER: ConversationStarter = {
    title: 'Improve this skill based on recent handovers',
    message: 'Improve this skill based on recent handovers',
}

const SKILL_DETAIL_GAPS_STARTER: ConversationStarter = {
    title: "Find gaps in this skill's instructions",
    message: "Find gaps in this skill's instructions",
}

const KNOWLEDGE_MIGRATE_STARTER: ConversationStarter = {
    title: 'Help me migrate my guidance to skills',
    message: 'Help me migrate my guidance to skills',
}

const SKILL_GUIDANCE_DIFFERENCE_STARTER: ConversationStarter = {
    title: "What's the difference between a skill and guidance?",
    message: "What's the difference between a skill and guidance?",
}

const ACTIONS_DISCOVER_STARTER: ConversationStarter = {
    title: 'Improve my action setup',
    message: 'Improve my action setup',
}

const AI_AGENT_PATH_REGEX = /^\/app\/ai-agent\/[^/]+\/[^/]+(?:\/(.*))?$/

export function parseAiAgentSubPath(pathname: string): string | null {
    const cleanPath = pathname.split('?')[0].split('#')[0]
    const match = AI_AGENT_PATH_REGEX.exec(cleanPath)
    if (!match) return null
    return match[1] ?? ''
}

export function getCopilotConversationStarters(
    pathname: string,
): ConversationStarter[] {
    const subPath = parseAiAgentSubPath(pathname)
    if (subPath === null) return []

    if (isInSection(subPath, 'opportunities')) return []
    if (isInSection(subPath, 'products')) return []
    if (isInSection(subPath, 'sales')) return []
    if (isInSection(subPath, 'deploy')) return []
    if (isInSection(subPath, 'settings')) return []
    if (subPath === 'test') return []
    if (subPath === 'tone-of-voice') return []

    if (subPath === 'skills') {
        return [
            SKILLS_LIST_STARTER,
            SKILL_GUIDANCE_DIFFERENCE_STARTER,
            UNIVERSAL_STARTER,
        ]
    }
    if (subPath === 'skills/new' || subPath === 'skills/wizard') {
        return [SKILL_GUIDANCE_DIFFERENCE_STARTER, UNIVERSAL_STARTER]
    }
    if (subPath.startsWith('skills/')) {
        return [
            SKILL_DETAIL_IMPROVE_STARTER,
            SKILL_DETAIL_GAPS_STARTER,
            SKILL_GUIDANCE_DIFFERENCE_STARTER,
            UNIVERSAL_STARTER,
        ]
    }

    if (isInSection(subPath, 'knowledge')) {
        return [
            KNOWLEDGE_MIGRATE_STARTER,
            SKILL_GUIDANCE_DIFFERENCE_STARTER,
            UNIVERSAL_STARTER,
        ]
    }

    if (isInSection(subPath, 'actions')) {
        return [ACTIONS_DISCOVER_STARTER, UNIVERSAL_STARTER]
    }

    return [UNIVERSAL_STARTER]
}

function isInSection(subPath: string, section: string): boolean {
    return subPath === section || subPath.startsWith(`${section}/`)
}
