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

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}${DROPDOWN_NESTING_DELIMITER}${level2}`,
            )
        })

        it('should handle handover outcome with custom level 2 text', () => {
            const level2 = 'Escalated to manager'
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}${DROPDOWN_NESTING_DELIMITER}${level2}`

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}${DROPDOWN_NESTING_DELIMITER}${level2}`,
            )
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

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })

        it('should format automated outcome with nested levels', () => {
            const outcome = `Close${DROPDOWN_NESTING_DELIMITER}With message`

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })

        it('should format automated outcome with multiple nested levels', () => {
            const outcome = `Action${DROPDOWN_NESTING_DELIMITER}Subaction${DROPDOWN_NESTING_DELIMITER}Detail`

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })
    })

    describe('edge cases', () => {
        it('should handle outcome with only delimiter', () => {
            const outcome = DROPDOWN_NESTING_DELIMITER

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })

        it('should handle outcome starting with handover prefix check', () => {
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}Extra text`

            const result = formatOutcome(outcome)

            expect(result).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
        })

        it('should handle outcome not starting with handover prefix', () => {
            const outcome = 'Some other outcome'

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })

        it('should handle whitespace in outcome', () => {
            const outcome = '  Close  '

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })

        it('should handle special characters in outcome', () => {
            const outcome = 'Close & Tag <test>'

            const result = formatOutcome(outcome)

            expect(result).toBe(
                `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`,
            )
        })
    })

    describe('delimiter behavior', () => {
        it('should preserve original delimiter positions for automated outcomes', () => {
            const level1 = 'Level1'
            const level2 = 'Level2'
            const level3 = 'Level3'
            const outcome = `${level1}${DROPDOWN_NESTING_DELIMITER}${level2}${DROPDOWN_NESTING_DELIMITER}${level3}`

            const result = formatOutcome(outcome)

            expect(result).toContain(level1)
            expect(result).toContain(level2)
            expect(result).toContain(level3)
            expect(result?.split(DROPDOWN_NESTING_DELIMITER).length).toBe(4)
        })

        it('should maintain delimiter for handover with level 2', () => {
            const level2 = 'Reason for handover'
            const outcome = `${CUSTOM_FIELD_AI_AGENT_HANDOVER}${DROPDOWN_NESTING_DELIMITER}${level2}`

            const result = formatOutcome(outcome)

            const parts = result?.split(DROPDOWN_NESTING_DELIMITER)
            expect(parts).toHaveLength(2)
            expect(parts?.[0]).toBe(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover)
            expect(parts?.[1]).toBe(level2)
        })
    })
})
