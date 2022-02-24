import {buildPasswordAnd2FaText, checkAccessTo2FA} from '../utils'

describe('utils.ts', () => {
    describe('checkAccessTo2FA()', () => {
        it.each([
            ['acme', true],
            ['test-martin', true],
            ['blablabla.preview', true],
            ['some-random-one', false],
            ['', false],
        ])(
            'should return if a domain has access or not to the 2FA',
            (domain, expectedValue) => {
                const hasAccessTo2FA = checkAccessTo2FA(domain)

                expect(hasAccessTo2FA).toEqual(expectedValue)
            }
        )
    })

    describe('buildPasswordAnd2FaText()', () => {
        it.each([
            [true, true, 'Password & 2FA'],
            [false, true, '2FA'],
            [false, false, 'Change password'],
        ])(
            'should build the text as expected',
            (
                hasPassword: boolean,
                hasAccessTo2FA: boolean,
                expectedValue: string
            ) => {
                const passwordAnd2FaText = buildPasswordAnd2FaText(
                    hasPassword,
                    hasAccessTo2FA
                )

                expect(passwordAnd2FaText).toEqual(expectedValue)
            }
        )
    })
})
