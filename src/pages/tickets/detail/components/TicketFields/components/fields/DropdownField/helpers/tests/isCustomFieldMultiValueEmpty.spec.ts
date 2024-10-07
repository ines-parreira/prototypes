import {CustomFieldValue} from 'custom-fields/types'

import isCustomFieldMultiValueEmpty from '../isCustomFieldMultiValueEmpty'

describe('isCustomFieldMultiValueEmpty', () => {
    it('should return true for a non-array', () => {
        const values: unknown = 'test'
        expect(isCustomFieldMultiValueEmpty(values)).toBe(true)
    })

    it('should return true for an empty array', () => {
        const values: unknown = []
        expect(isCustomFieldMultiValueEmpty(values)).toBe(true)
    })

    it('should return true for an array with empty values', () => {
        const values = ['', '', '']
        expect(isCustomFieldMultiValueEmpty(values)).toBe(true)
    })

    it('should return false for an array with non-empty values', () => {
        const values: CustomFieldValue[] = ['test1', 'test2', 'test3']
        expect(isCustomFieldMultiValueEmpty(values)).toBe(false)
    })
})
