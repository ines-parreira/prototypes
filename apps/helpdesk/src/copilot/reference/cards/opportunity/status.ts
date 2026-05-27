import { TagColor } from '@gorgias/axiom'

import { OpportunityType } from 'pages/aiAgent/opportunities/enums'

import type { ReferenceCardStatus } from '../shared/ReferenceCardShell'

export function getOpportunityTypeTag(
    type: OpportunityType,
): ReferenceCardStatus {
    switch (type) {
        case OpportunityType.FILL_KNOWLEDGE_GAP:
            return { label: 'Knowledge gap', color: TagColor.Blue }
        case OpportunityType.RESOLVE_CONFLICT:
            return { label: 'Conflict', color: TagColor.Orange }
    }
}
