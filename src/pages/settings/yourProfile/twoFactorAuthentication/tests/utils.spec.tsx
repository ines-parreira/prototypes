import {buildPasswordAnd2FaText, checkAccessTo2FAEnforcement} from '../utils'

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
