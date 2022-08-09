import {isValidGaid} from '../utils'

describe('isValidGaid()', () => {
    it.each(['UA-123qwerty', 'UA-123QWERTY', 'G-QWERTY123'])(
        'returns true for %s',
        (value) => {
            expect(isValidGaid(value)).toBeTruthy()
        }
    )
    it.each(['UA-', 'G-', '123456', 'qwerty'])(
        'returns false for %s',
        (value) => {
            expect(isValidGaid(value)).toBeFalsy()
        }
    )
})
