import { TagColor } from '@gorgias/axiom'

import type { ReferenceCardStatus } from '../shared/ReferenceCardShell'

export function getSupportActionStatusTag(
    isDraft: boolean | undefined,
): ReferenceCardStatus {
    if (isDraft) {
        return { label: 'Draft', color: TagColor.Grey }
    }
    return { label: 'Active', color: TagColor.Green }
}
