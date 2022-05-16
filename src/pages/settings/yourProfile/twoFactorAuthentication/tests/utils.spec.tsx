import {buildPasswordAnd2FaText, check2FARequired} from '../utils'

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

    describe('check2FARequired()', () => {
        it.each([
            [null, true, false],
            ['2022-03-24T14:17:05', true, false],
            ['2022-03-24T14:17:05', false, true],
            [new Date().toString(), false, false],
        ])(
            'should build the text as expected',
            (
                twoFAEnforcedDatetime: Maybe<string>,
                has2FAEnabled: boolean,
                expectedValue: boolean
            ) => {
                const is2FARequired = check2FARequired(
                    twoFAEnforcedDatetime,
                    has2FAEnabled
                )

                expect(is2FARequired).toEqual(expectedValue)
            }
        )
    })
})
