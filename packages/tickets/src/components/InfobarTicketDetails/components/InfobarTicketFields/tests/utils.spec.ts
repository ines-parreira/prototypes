import type { CustomField } from '@gorgias/helpdesk-types'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import { isFieldErrored } from '../utils/isFieldErrored'
import { isFieldRequired } from '../utils/isFieldRequired'
import { isFieldVisible } from '../utils/isFieldVisible'

describe('InfobarTicketFields utils', () => {
    describe('isFieldRequired', () => {
        it('should return true when field is required by default', () => {
            const field: CustomField = {
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField

            expect(isFieldRequired(field)).toBe(true)
        })

        it('should return false when field is not required by default', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField

            expect(isFieldRequired(field)).toBe(false)
        })

        it('should return true when field has conditional requirement and evaluation result is required', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldRequired(field, ExpressionFieldType.Required)).toBe(
                true,
            )
        })

        it('should return false when field has conditional requirement and evaluation result is visible', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldRequired(field, ExpressionFieldType.Visible)).toBe(
                false,
            )
        })

        it('should return false when field has conditional requirement and evaluation result is undefined', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldRequired(field, undefined)).toBe(false)
        })

        it('should return true when field is required even if conditionally visible', () => {
            const field: CustomField = {
                required: true,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldRequired(field, ExpressionFieldType.Visible)).toBe(
                true,
            )
        })
    })

    describe('isFieldVisible', () => {
        it('should return true when field is not required and has no conditional requirement', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField

            expect(isFieldVisible(field)).toBe(true)
        })

        it('should return false when field is required by default', () => {
            const field: CustomField = {
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField

            expect(isFieldVisible(field)).toBe(false)
        })

        it('should return true when field has conditional requirement and evaluation result is visible', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldVisible(field, ExpressionFieldType.Visible)).toBe(
                true,
            )
        })

        it('should return false when field has conditional requirement and evaluation result is required', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldVisible(field, ExpressionFieldType.Required)).toBe(
                false,
            )
        })

        it('should return false when field has conditional requirement and evaluation result is undefined', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldVisible(field, undefined)).toBe(false)
        })

        it('should return false when field has conditional requirement and no evaluation result', () => {
            const field: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            expect(isFieldVisible(field)).toBe(false)
        })
    })

    describe('isFieldErrored', () => {
        it('should return true when required field has empty values (undefined, empty string, or no fieldState)', () => {
            const fieldDefinition: CustomField = {
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState: { id: 1, value: undefined },
                }),
            ).toBe(true)

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState: { id: 1, value: '' },
                }),
            ).toBe(true)

            expect(
                isFieldErrored({ fieldDefinition, fieldState: undefined }),
            ).toBe(true)
        })

        it('should handle falsy values correctly for required fields (0 and false are valid)', () => {
            const fieldDefinition: CustomField = {
                required: true,
                requirement_type: RequirementType.Required,
            } as CustomField

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState: { id: 1, value: 0 },
                }),
            ).toBe(false)

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState: { id: 1, value: false },
                }),
            ).toBe(false)

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState: { id: 1, value: 'some value' },
                }),
            ).toBe(false)
        })

        it('should return false when optional field has empty value', () => {
            const fieldDefinition: CustomField = {
                required: false,
                requirement_type: RequirementType.Visible,
            } as CustomField

            const fieldState = {
                id: 1,
                value: undefined,
            }

            expect(isFieldErrored({ fieldDefinition, fieldState })).toBe(false)
        })

        it('should return true when conditionally required field has empty value', () => {
            const fieldDefinition: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            const fieldState = {
                id: 1,
                value: undefined,
            }

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState,
                    conditionalRequirementType: ExpressionFieldType.Required,
                }),
            ).toBe(true)
        })

        it('should return false when conditionally visible field has empty value', () => {
            const fieldDefinition: CustomField = {
                required: false,
                requirement_type: RequirementType.Conditional,
            } as CustomField

            const fieldState = {
                id: 1,
                value: undefined,
            }

            expect(
                isFieldErrored({
                    fieldDefinition,
                    fieldState,
                    conditionalRequirementType: ExpressionFieldType.Visible,
                }),
            ).toBe(false)
        })
    })
})
