// Anchor attribute convention for copilot follow mode. Pages stamp
// `data-copilot-anchor` ids ("skill:123" / "skill:123:instructions") that the
// highlight engine resolves to DOM elements. No shop context: pages are
// already shop-scoped.

import type { CopilotSectionId, CopilotTargetType } from '@gorgias/copilot'

export const COPILOT_ANCHOR_ATTRIBUTE = 'data-copilot-anchor'

export type CopilotAnchorTarget = {
    type: CopilotTargetType
    id: number | string
}

export function copilotAnchorId(
    target: CopilotAnchorTarget,
    section?: CopilotSectionId,
): string {
    const entityId = `${target.type}:${target.id}`
    return section ? `${entityId}:${section}` : entityId
}

export function copilotAnchorProps(
    target: CopilotAnchorTarget,
    section?: CopilotSectionId,
): Record<typeof COPILOT_ANCHOR_ATTRIBUTE, string> {
    return { [COPILOT_ANCHOR_ATTRIBUTE]: copilotAnchorId(target, section) }
}

// Section anchor first (when requested), then the entity anchor as fallback.
export function anchorCandidates(
    target: CopilotAnchorTarget,
    section?: CopilotSectionId,
): string[] {
    const entityAnchorId = copilotAnchorId(target)
    return section
        ? [copilotAnchorId(target, section), entityAnchorId]
        : [entityAnchorId]
}
