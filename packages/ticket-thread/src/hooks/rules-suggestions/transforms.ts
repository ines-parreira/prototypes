import type { RuleSuggestionMeta } from './types'

const RULE_SUGGESTION_REPLY_ACTION = 'replyToTicket'

const LEGACY_MACRO_ACTION_NAMES = new Set([
    'addAttachments',
    'addInternalNote',
    'addTags',
    'applyExternalTemplate',
    'excludeFromAutoMerge',
    'excludeFromCSAT',
    'forwardByEmail',
    'http',
    'rechargeActivateLastSubscription',
    'rechargeCancelLastSubscription',
    'rechargeRefundLastCharge',
    'rechargeRefundLastOrder',
    'removeTags',
    'setAssignee',
    'setCustomFieldValue',
    'setCustomerCustomFieldValue',
    'setPriority',
    'setResponseText',
    'setStatus',
    'setSubject',
    'setTeamAssignee',
    'shopifyCancelLastOrder',
    'shopifyCancelOrder',
    'shopifyDuplicateLastOrder',
    'shopifyEditNoteOfLastOrder',
    'shopifyEditShippingAddressOfLastOrder',
    'shopifyFullRefundLastOrder',
    'shopifyPartialRefundLastOrder',
    'shopifyRefundShippingCostOfLastOrder',
    'snoozeTicket',
    'snoozeTicketDuration',
])

function isRecord(input: unknown): input is Record<string, unknown> {
    return typeof input === 'object' && input !== null
}

function getRuleSuggestionActions(
    ruleSuggestionMeta: RuleSuggestionMeta,
): Record<string, unknown>[] {
    if (!isRecord(ruleSuggestionMeta.rule_suggestion)) {
        return []
    }

    const actions = ruleSuggestionMeta.rule_suggestion.actions
    if (!Array.isArray(actions)) {
        return []
    }

    return actions.filter(isRecord)
}

export function isRuleSuggestionEmpty(ruleSuggestionMeta: RuleSuggestionMeta) {
    const actions = getRuleSuggestionActions(ruleSuggestionMeta)

    const hasText = actions.some(
        (action) =>
            action.name === RULE_SUGGESTION_REPLY_ACTION &&
            Boolean(action.args),
    )

    const hasMacroActions = actions.some(
        (action) =>
            typeof action.name === 'string' &&
            action.name !== RULE_SUGGESTION_REPLY_ACTION &&
            LEGACY_MACRO_ACTION_NAMES.has(action.name),
    )

    return !hasText && !hasMacroActions
}

type ShouldRenderRuleSuggestionParams = {
    ruleSuggestionMeta: RuleSuggestionMeta | null
    shouldDisplayDemoSuggestion: boolean
}

export function shouldRenderRuleSuggestion({
    ruleSuggestionMeta,
    shouldDisplayDemoSuggestion,
}: ShouldRenderRuleSuggestionParams): boolean {
    if (!ruleSuggestionMeta) {
        return false
    }

    if (!shouldDisplayDemoSuggestion) {
        return false
    }

    return !isRuleSuggestionEmpty(ruleSuggestionMeta)
}
