import {isCustomFieldValueEmpty} from '../isCustomFieldValueEmpty'

describe('isCustomFieldValueEmpty', () => {
    it.each([
        ['', true],
        [undefined, true],
        [' ', false],
        ['a', false],
        [0, false],
        [1, false],
    ])('should check if custom field value is empty', (input, result) => {
        expect(isCustomFieldValueEmpty(input)).toBe(result)
    })
})
