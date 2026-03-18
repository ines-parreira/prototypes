import type { GuidanceTemplate } from 'pages/aiAgent/types'

export type SkillTemplate = {
    id: string
    name: string
    guidanceId: string
    guidance: GuidanceTemplate
    tag: string
    style: { color: string; background: string }
    intents: string[]
}
