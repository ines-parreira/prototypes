import {CustomFieldValue} from 'custom-fields/types'

import isMultiValueEmpty from '../isMultiValueEmpty'

describe('isMultiValueEmpty', () => {
    it('should return true for a non-array', () => {
        const values: unknown = 'test'
        expect(isMultiValueEmpty(values)).toBe(true)
    })

    it('should return true for an empty array', () => {
        const values: unknown = []
        expect(isMultiValueEmpty(values)).toBe(true)
    })

    it('should return true for an array with empty values', () => {
        const values = ['', '', '']
        expect(isMultiValueEmpty(values)).toBe(true)
    })

    it('should return false for an array with non-empty values', () => {
        const values: CustomFieldValue[] = ['test1', 'test2', 'test3']
        expect(isMultiValueEmpty(values)).toBe(false)
    })
})
