import {isCustomFieldValueEmpty} from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {assumeMock} from 'utils/testing'

import {getNumberOrUndefined} from '../getNumberOrUndefined'

jest.mock('../isCustomFieldValueEmpty')

const mockedIsCustomFieldValueEmpty = assumeMock(isCustomFieldValueEmpty)

describe('getNumberOrUndefined', () => {
    beforeEach(() => {
        mockedIsCustomFieldValueEmpty.mockReturnValue(false)
    })

    it('should return undefined when value is empty', () => {
        mockedIsCustomFieldValueEmpty.mockReturnValue(true)
        expect(getNumberOrUndefined(1)).toBeUndefined()
    })

    it.each([[true], [false]])(
        'should return undefined when value is not a number or string',
        (value) => {
            expect(getNumberOrUndefined(value)).toBeUndefined()
        }
    )

    it.each([
        [1, 1],
        ['1', 1],
        ['ah', NaN],
    ])('should return %s when value is %s', (value, expected) => {
        expect(getNumberOrUndefined(value)).toBe(expected)
    })
})
