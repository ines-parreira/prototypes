import type { GuidanceTemplate } from 'pages/aiAgent/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export enum IntentStatus {
    Linked = 'linked',
    NotLinked = 'not_linked',
    Handover = 'handover',
}

export type Intent = Components.Schemas.IntentResponseDto

export type SkillTemplate = {
    id: string
    name: string
    guidanceId: string
    guidance?: GuidanceTemplate
    tag: string
    style: { color: string; background: string }
    intents: Intent[]
}
