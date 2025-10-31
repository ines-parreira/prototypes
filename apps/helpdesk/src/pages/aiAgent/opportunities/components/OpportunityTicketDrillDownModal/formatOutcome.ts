import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
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

    const hasDelimiter = outcome.includes(DROPDOWN_NESTING_DELIMITER)
    const [level1, level2] = hasDelimiter
        ? outcome.split(DROPDOWN_NESTING_DELIMITER)
        : [outcome, undefined]

    if (level1?.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)) {
        if (level2) {
            return `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}${DROPDOWN_NESTING_DELIMITER}${level2}`
        }
        return AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
    }

    return `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`
}
