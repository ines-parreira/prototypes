import {
    AI_AGENT_OUTCOME_DISPLAY_LABELS,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from 'domains/reporting/hooks/automate/types'

export const formatOutcome = (
    outcome: string | undefined,
): string | undefined => {
    if (!outcome) {
        return undefined
    }

    if (outcome?.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)) {
        return AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
    }

    return AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated
}
