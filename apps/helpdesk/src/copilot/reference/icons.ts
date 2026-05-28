import type { IconName } from '@gorgias/axiom'

import type { GorgiasCopilotReference } from '@gorgias/copilot'

type ReferenceVisual = {
    icon: IconName
    label: string
}

const REFERENCE_VISUALS: Record<
    GorgiasCopilotReference['type'],
    ReferenceVisual
> = {
    ticket: { icon: 'mail', label: 'Ticket' },
    guidance: { icon: 'nav-map', label: 'Guidance' },
    skill: { icon: 'ai-alt-1', label: 'Skill' },
    opportunity: { icon: 'light-bulb', label: 'Opportunity' },
    'support-action': { icon: 'webhook', label: 'Action' },
}

export function getReferenceVisual(
    type: GorgiasCopilotReference['type'],
): ReferenceVisual {
    return REFERENCE_VISUALS[type]
}
