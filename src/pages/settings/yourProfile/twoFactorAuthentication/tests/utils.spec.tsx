import {buildPasswordAnd2FaText} from '../utils'

describe('utils.ts', () => {
    describe('buildPasswordAnd2FaText()', () => {
        it.each([
            [true, 'Password & 2FA'],
            [false, '2FA'],
        ])(
            'should build the text as expected',
            (hasPassword: boolean, expectedValue: string) => {
                const passwordAnd2FaText = buildPasswordAnd2FaText(hasPassword)

                expect(passwordAnd2FaText).toEqual(expectedValue)
            }
        )
    })
})
