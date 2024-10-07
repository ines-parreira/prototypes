import {CustomField, isCustomField, isCustomFieldAIManagedType} from '../types'

describe('custom field types', () => {
    describe('isCustomField', () => {
        it('should return true as object has id', () => {
            const customField = {
                id: 1,
                priority: 0,
                created_datetime: '',
                updated_datetime: '',
                deactivated_datetime: '',
            } as CustomField
            expect(isCustomField(customField)).toBe(true)
        })

        it("should return false as object doesn't have id", () => {
            const customField = {
                priority: 0,
                created_datetime: '',
                updated_datetime: '',
                deactivated_datetime: '',
            } as CustomField
            expect(isCustomField(customField)).toBe(false)
        })
    })

    describe('is IA Agent managed', () => {
        it('should return considering managedType match', () => {
            expect(isCustomFieldAIManagedType('ai_intent')).toBe(true)
            expect(isCustomFieldAIManagedType('ai_outcome')).toBe(true)
            expect(isCustomFieldAIManagedType('ai_doest_exists')).toBe(false)
            expect(isCustomFieldAIManagedType('')).toBe(false)
            expect(isCustomFieldAIManagedType(null)).toBe(false)
            expect(isCustomFieldAIManagedType('contact_reason')).toBe(false)
            expect(isCustomFieldAIManagedType('product')).toBe(false)
            expect(isCustomFieldAIManagedType('resolution')).toBe(false)
        })
    })
})
