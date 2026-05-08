import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

export const isInstructionsEmpty = (html: string): boolean => {
    if (!html) return true
    const stripped = html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
    return stripped.length === 0
}

export const hasActionRequiringSetup = (
    html: string,
    availableActions: GuidanceAction[],
): boolean => {
    if (!html) return false

    const seen = new Set<string>()
    const regex = new RegExp(
        guidanceActionRegex.source,
        guidanceActionRegex.flags,
    )
    let match: RegExpExecArray | null
    while ((match = regex.exec(html)) !== null) {
        const id = match[1]
        if (seen.has(id)) continue
        seen.add(id)

        const action = availableActions.find((a) => a.value === id)
        if (!action) continue
        if (action.requiresAuth || action.hasMissingValues) return true
    }
    return false
}
