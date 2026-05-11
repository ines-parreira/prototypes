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

const collectReferencedActionIds = (
    html: string,
    availableActions: GuidanceAction[],
    predicate: (action: GuidanceAction) => boolean,
): string[] => {
    if (!html) return []

    const seen = new Set<string>()
    const result: string[] = []
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
        if (predicate(action)) result.push(id)
    }

    return result
}

/**
 * Review step gate: an action that requires authorization or has missing
 * values cannot be auto-fixed, so a skill referencing one must be saved as
 * a draft.
 */
export const hasActionRequiringSetup = (
    html: string,
    availableActions: GuidanceAction[],
): boolean =>
    collectReferencedActionIds(
        html,
        availableActions,
        (action) =>
            action.requiresAuth === true || action.hasMissingValues === true,
    ).length > 0

/**
 * Recap step: every skill here is already valid (drafts never reach the
 * recap), so the only thing left to surface is actions that are currently
 * disabled.
 */
export const getDisabledActionIds = (
    html: string,
    availableActions: GuidanceAction[],
): string[] =>
    collectReferencedActionIds(
        html,
        availableActions,
        (action) => action.enabled === false,
    )
