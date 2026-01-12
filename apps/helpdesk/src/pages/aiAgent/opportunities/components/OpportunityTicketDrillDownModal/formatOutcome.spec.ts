import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import {
    AI_AGENT_OUTCOME_DISPLAY_LABELS,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from 'domains/reporting/hooks/automate/types'

import { formatOutcome } from './formatOutcome'

describe('formatOutcome', () => {
    describe('undefined or empty input', () => {
        it('should return undefined when outcome is undefined', () => {
            expect(formatOutcome(undefined)).toBeUndefined()
        })

        it('should return undefined when outcome is empty string', () => {
            expect(formatOutcome('')).toBeUndefined()
        })

        it('should return undefined when outcome is null', () => {
            expect(formatOutcome(null as unknown as undefined)).toBeUndefined()
        })
    })

    describe('handover outcomes', () => {
        it('should format handover outcome without level 2', () => {
            const outcome = CUSTOM_FIELD_AI_AGENT_HANDOVER

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })

        it('should format handover outcome with level 2', () => {
            const level2 = 'Complex question'
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}${DROPDOWN_NESTING_DELIMITER}${level2}`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })

        it('should handle handover outcome with custom level 2 text', () => {
            const level2 = 'Escalated to manager'
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}${DROPDOWN_NESTING_DELIMITER}${level2}`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })

        it('should handle handover with empty level 2', () => {
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}${DROPDOWN_NESTING_DELIMITER}`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })
    })

    describe('automated outcomes', () => {
        it('should format simple automated outcome without delimiter', () => {
            const outcome = 'Close'

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should format automated outcome with nested levels', () => {
            const outcome = `Close${DROPDOWN_NESTING_DELIMITER}With message`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should format automated outcome with multiple nested levels', () => {
            const outcome = `Action${DROPDOWN_NESTING_DELIMITER}Subaction${DROPDOWN_NESTING_DELIMITER}Detail`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should return Automated for outcome that does not start with handover prefix', () => {
            const outcome = 'Resolved'

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
            expect(outcome.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)).toBe(
                false,
            )
        })
    })

    describe('edge cases', () => {
        it('should handle outcome with only delimiter', () => {
            const outcome = DROPDOWN_NESTING_DELIMITER

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should handle outcome starting with handover prefix check', () => {
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}Extra text`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })

        it('should handle outcome not starting with handover prefix', () => {
            const outcome = 'Some other outcome'

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should return Automated when outcome contains but does not start with handover prefix', () => {
            const outcome = `Prefix_${CUSTOM_FIELD_AI_AGENT_HANDOVER}`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
            expect(outcome.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)).toBe(
                false,
            )
        })

        it('should handle whitespace in outcome', () => {
            const outcome = '  Close  '

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })

        it('should handle special characters in outcome', () => {
            const outcome = 'Close & Tag <test>'

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
        })
    })
})
