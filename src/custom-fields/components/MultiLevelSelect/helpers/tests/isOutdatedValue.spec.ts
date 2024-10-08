import {CustomFieldValue} from 'custom-fields/types'
import {isOutdatedValue} from '../isOutdatedValue'

describe('isOutdatedValue', () => {
    const choices: CustomFieldValue[] = ['option 1', 'option 2', 'option']

    it('should return false if value is undefined', () => {
        const value: CustomFieldValue | undefined = undefined
        expect(isOutdatedValue(value, choices)).toBe(false)
    })

    it('should return false if value is in choices', () => {
        const value: CustomFieldValue = choices[0]
        expect(isOutdatedValue(value, choices)).toBe(false)
    })

    it('should return false if value is not in choices', () => {
        const value: CustomFieldValue = 'Option 4'
        expect(isOutdatedValue(value, choices)).toBe(true)
    })
})
