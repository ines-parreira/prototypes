import {
    buildInternationalNumber,
    formatAsNationalNumber,
    getCountryFromPhoneNumber,
    normalizeNumber,
} from '../utils'

describe('buildInternationalNumber()', () => {
    it('should return unformatted numbers in international format', () => {
        expect(buildInternationalNumber('234 567 8910', 'US')).toEqual(
            '+12345678910'
        )
        expect(buildInternationalNumber('2 34 56 78 91', 'FR')).toEqual(
            '+33234567891'
        )
    })

    it("should use the given country's calling code if given an international number", () => {
        expect(buildInternationalNumber('+1 234 567 8910', 'FR')).toEqual(
            '+332345678910'
        )
    })
})

describe('formatAsNationalNumber()', () => {
    it.each([
        ['+1234 567 8910', '234 567 8910'],
        ['+12345678910', '234 567 8910'],
        ['+33 2 34 56 78 91', '2 34 56 78 91'],
    ])(
        'should strip the country calling code when given an international number',
        (number, nationalNumber) => {
            expect(formatAsNationalNumber(number)).toEqual(nationalNumber)
        }
    )

    it.each([
        ['33 2 34 56 78 91', '33 2 34 56 78 91'],
        ['1234 567 8910', '1234 567 8910'],
    ])(
        'should return the given number if not in international format',
        (number, nationalNumber) => {
            expect(formatAsNationalNumber(number)).toEqual(nationalNumber)
        }
    )
})

describe('normalizeNumber()', () => {
    it.each([
        ['+1 234 567 8910', '+12345678910'],
        ['(415) 555-0132', '4155550132'],
        ['(415) 555+0132', '4155550132'],
    ])(
        'should remove spaces and brakets from international formatted numbers',
        (number, normalizedNumber) => {
            expect(normalizeNumber(number)).toEqual(normalizedNumber)
        }
    )
})

describe('getCountryFromPhoneNumber()', () => {
    it.each([
        ['+1 234 567 8910', 'US'],
        ['+33 2 34 56 78 91', 'FR'],
        ['+352 79 1234', 'LU'],
    ])('should infer country from full valid numbers', (number, country) => {
        expect(getCountryFromPhoneNumber(number)).toEqual(country)
    })

    it.each([
        ['+1', 'US'],
        ['+33', 'FR'],
        ['+44', 'GB'],
        ['+1911', 'US'],
        ['+4412', 'GB'],
        ['+44123', 'GB'],
        ['+44123', 'GB'],
        ['+331234', 'FR'],
    ])(
        'should infer country when given short, invalid numbers',
        (number, country) => {
            expect(getCountryFromPhoneNumber(number)).toEqual(country)
        }
    )
})
