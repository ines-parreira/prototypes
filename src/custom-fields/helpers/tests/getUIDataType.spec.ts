import {getUIDataType} from '../getUIDataType'

describe('getUIDataType', () => {
    it('should return the expected value', () => {
        expect(getUIDataType('text', 'input')).toBe('input_text')
        expect(getUIDataType('number', 'input_number')).toBe(
            'input_number_number'
        )
        expect(getUIDataType('number', 'dropdown')).toBe('dropdown_number')
    })
})
