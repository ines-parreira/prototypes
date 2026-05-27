import { TagColor } from '@gorgias/axiom'

import type { GuidanceArticle } from 'pages/aiAgent/types'

import type { ReferenceCardStatus } from '../shared/ReferenceCardShell'

/**
 * Mirrors `getToolbarState` in
 * KnowledgeEditorTopBar/KnowledgeEditorTopBarSkillControls.tsx:
 *   isCurrent === true       -> Published (no pending draft)
 *   has published version    -> Draft changes
 *   otherwise                -> Draft
 */
export function getStatusTag(article: GuidanceArticle): ReferenceCardStatus {
    if (article.isCurrent === true) {
        return { label: 'Published', color: TagColor.Green }
    }
    if (article.publishedVersionId !== null) {
        return { label: 'Draft changes', color: TagColor.Orange }
    }
    return { label: 'Draft', color: TagColor.Grey }
}
