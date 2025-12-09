import {
    formatPhoneNumberInternational,
    isEmail,
    validateChannelField,
} from '../validation'

describe('validation utils', () => {
    describe('isEmail', () => {
        const correct = [
            'email@example.com',
            'firstname.lastname@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            'email@123.123.123.123',
            '1234567890@example.com',
            'email@example-one.com',
            '_______@example.com',
            '-------@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.co.jp',
            'firstname-lastname@example.com',
        ]

        const incorrect = [
            'plainaddress',
            'hello@example',
            'hello@example.',
            '@example.com',
            'hello@exam ple.com',
        ]

        it('should return true for valid emails', () => {
            correct.forEach((input) => {
                expect(isEmail(input)).toBe(true)
            })
        })

        it('should return false for invalid emails', () => {
            incorrect.forEach((input) => {
                expect(isEmail(input)).toBe(false)
            })
        })
    })

    describe('formatPhoneNumberInternational', () => {
        it('should return formatted number for a valid number', () => {
            expect(formatPhoneNumberInternational('+12133734253')).toBe(
                '+1 213 373 4253',
            )
        })

        it('should return unformatted number for an invalid number', () => {
            expect(formatPhoneNumberInternational('+1abc3734253')).toBe(
                '+1abc3734253',
            )
        })

        it('should return an empty string when number is undefined/empty', () => {
            expect(formatPhoneNumberInternational(undefined)).toBe('')
            expect(formatPhoneNumberInternational('')).toBe('')
        })
    })

    describe('validateChannelField', () => {
        describe('email validation', () => {
            it('should return undefined for valid email', () => {
                expect(validateChannelField('email', 'test@example.com')).toBe(
                    undefined,
                )
            })

            it('should return error message for invalid email', () => {
                expect(validateChannelField('email', 'notanemail')).toBe(
                    'Invalid email address',
                )
            })

            it('should return undefined for empty/whitespace input', () => {
                expect(validateChannelField('email', '   ')).toBe(undefined)
            })
        })

        describe('phone validation', () => {
            it('should return undefined for valid phone numbers', () => {
                // Use real valid phone numbers
                expect(validateChannelField('phone', '+12133734253')).toBe(
                    undefined,
                )
            })

            it('should return error message for invalid phone numbers', () => {
                expect(validateChannelField('phone', '123')).toBe(
                    'Invalid phone number',
                )
            })

            it('should return undefined for empty/whitespace input', () => {
                expect(validateChannelField('phone', '   ')).toBe(undefined)
            })
        })
    })
})
