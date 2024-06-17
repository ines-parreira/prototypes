import {DROPDOWN_VALUES_LIMIT} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/constants'
import {
    validateHeaderName,
    checkDuplicates,
    validateDropdownValues,
} from '../validators'

describe('validateHeaderName', () => {
    it('should return an error message when having unicode characters in headers', () => {
        expect(validateHeaderName('😀', 'headers')).toBe(
            "Header's name can't contain unicode characters."
        )
        expect(validateHeaderName('😀', 'someotherpath')).toBeUndefined()
        expect(validateHeaderName('key', 'headers')).toBeUndefined()
    })
})

describe('checkDuplicates', () => {
    it('should return true when having duplicates', () => {
        const params = [{key: 'key1'}, {key: 'key2'}, {key: 'key1'}]
        expect(checkDuplicates(params)).toBeTruthy()
    })

    it('should return false when not having duplicates', () => {
        const params = [{key: 'key1'}, {key: 'key2'}, {key: 'key3'}]
        expect(checkDuplicates(params)).toBeFalsy()
    })
})

describe('validateDropdownValues', () => {
    it('should return an error message when having more than DROPDOWN_VALUES_LIMIT values', () => {
        expect(
            validateDropdownValues(
                Array(DROPDOWN_VALUES_LIMIT + 1)
                    .fill('value')
                    .join(';')
            )
        ).toBe('Limit reached: only 10 first values will be saved.')
    })

    it('should return undefined when having DROPDOWN_VALUES_LIMIT or less values', () => {
        expect(
            validateDropdownValues(
                Array(DROPDOWN_VALUES_LIMIT).fill('value').join(';')
            )
        ).toBeUndefined()
    })
})
