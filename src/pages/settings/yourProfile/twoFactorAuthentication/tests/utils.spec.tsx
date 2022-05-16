import {
    buildPasswordAnd2FaText,
    check2FARequired,
    checkAccessTo2FAEnforcement,
} from '../utils'

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

    describe('checkAccessTo2FAEnforcement()', () => {
        it.each([
            ['acme', true],
            ['test-martin', true],
            ['blablabla.preview', true],
            ['some-random-one', false],
            ['', false],
        ])(
            'should return if a domain has access or not to the 2FA enforcement',
            (domain, expectedValue) => {
                const hasAccessTo2FA = checkAccessTo2FAEnforcement(domain)

                expect(hasAccessTo2FA).toEqual(expectedValue)
            }
        )
    })
})
