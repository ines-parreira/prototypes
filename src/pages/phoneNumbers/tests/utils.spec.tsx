import {IntegrationType} from 'models/integration/types'
import {phoneNumbers} from 'fixtures/phoneNumber'
import {
    NewPhoneNumber,
    OldPhoneNumber,
    PhoneConnectionType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'

import {
    countryCode,
    friendlyName,
    hasCapability,
    isNewPhoneNumber,
    isTwilioNumber,
    isWhatsAppNumber,
    buildInternationalNumber,
    formatAsNationalNumber,
    getCountryFromPhoneNumber,
    normalizeNumber,
    formatPhoneNumberInternational,
    shouldValidateAddress,
    getAvailableStates,
    getAddressValidationAlertMessage,
} from '../utils'
import {validationAlertMessages} from '../constants'

describe('isNewPhoneNumber()', () => {
    it('returns true if the number is of the new structure', () => {
        expect(
            isNewPhoneNumber({
                connections: [],
            } as unknown as NewPhoneNumber)
        ).toBe(true)
    })

    it('returns true if the number is of the new structure', () => {
        expect(
            isNewPhoneNumber({
                meta: {},
            } as OldPhoneNumber)
        ).toBe(false)
    })
})

describe('isWhatsAppNumber()', () => {
    it('returns true if the number has whatsapp meta', () => {
        expect(
            isWhatsAppNumber({
                connections: [
                    {
                        type: PhoneConnectionType.WhatsApp,
                        meta: {},
                    },
                ],
            } as NewPhoneNumber)
        ).toBe(true)
    })

    it('returns false if the number does not have whatsapp meta', () => {
        expect(
            isWhatsAppNumber({
                connections: [],
            } as unknown as NewPhoneNumber)
        ).toBe(false)
    })
})

describe('isTwilioNumber()', () => {
    it('returns true if the number has twilio meta', () => {
        expect(
            isTwilioNumber({
                connections: [
                    {
                        type: PhoneConnectionType.Twilio,
                        meta: {
                            type: PhoneType.Local,
                        },
                    },
                ],
            } as NewPhoneNumber)
        ).toBe(true)
    })

    it('returns false if the number does not have twilio meta', () => {
        expect(
            isTwilioNumber({
                connections: [],
            } as unknown as NewPhoneNumber)
        ).toBe(false)
    })
})

describe('hasCapability()', () => {
    it("maps integration type to a given phone number's capabilities", () => {
        const numberWithBothCapabilities = phoneNumbers[0]
        const numberWithoutSmsCapability = phoneNumbers[2]
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Phone)
        ).toEqual(true)
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Sms)
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Phone)
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Sms)
        ).toEqual(false)
    })
})

describe('countryCode()', () => {
    it("infers the country from the number if it's a whatsapp number", () => {
        expect(
            countryCode({
                phone_number: '+12345678910',
                connections: [
                    {
                        type: PhoneConnectionType.WhatsApp,
                        meta: {},
                    },
                ],
            } as NewPhoneNumber)
        ).toEqual('US')
    })

    it("returns the country provided by the backend if it's a (new format) twilio number", () => {
        expect(
            countryCode({
                connections: [
                    {
                        type: PhoneConnectionType.Twilio,
                        meta: {
                            address: {
                                country: PhoneCountry.US,
                            },
                        },
                    },
                ],
            } as NewPhoneNumber)
        ).toEqual(PhoneCountry.US)
    })

    it("returns the country provided by the backend if it's a (old format) twilio number", () => {
        expect(
            countryCode({
                meta: {
                    country: PhoneCountry.US,
                },
            } as OldPhoneNumber)
        ).toEqual(PhoneCountry.US)
    })
})

describe('friendlyName()', () => {
    it('returns the friendly name for a old format number', () => {
        expect(
            friendlyName({
                meta: {
                    friendly_name: '+123',
                },
            } as OldPhoneNumber)
        ).toEqual('+123')
    })

    it('returns the friendly name for a new format number', () => {
        expect(
            friendlyName({
                phone_number_friendly: '+123',
                connections: [],
            } as unknown as NewPhoneNumber)
        ).toEqual('+123')
    })
})

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

describe('formatPhoneNumberInternational', () => {
    it('should return formatted number for a valid number', () => {
        expect(formatPhoneNumberInternational('+12133734253')).toBe(
            '+1 213 373 4253'
        )
    })

    it('should return unformatted number for an invalid number', () => {
        expect(formatPhoneNumberInternational('+1abc3734253')).toBe(
            '+1abc3734253'
        )
    })

    it('should return an empty string when number is undefined', () => {
        expect(formatPhoneNumberInternational(undefined)).toBe('')
    })
})

describe('getCountryFromPhoneNumber()', () => {
    it.each([
        ['+1 234 567 8910', 'US'],
        ['+33 2 34 56 78 91', 'FR'],
        ['+352 79 1234', 'LU'],
        ['+1 844-307-6830', 'US'],
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

describe('shouldValidateAddress()', () => {
    const countries = [
        {country: PhoneCountry.US},
        {country: PhoneCountry.CA},
        {country: PhoneCountry.FR},
        {country: PhoneCountry.GB},
        {country: PhoneCountry.DE},
        {country: PhoneCountry.NZ},
        {country: PhoneCountry.AU, type: PhoneType.Mobile},
    ]

    it.each(countries)('should not validate address', ({country, type}) =>
        expect(shouldValidateAddress(country, type)).toBe(false)
    )

    it.each([{country: PhoneCountry.AU, type: PhoneType.Local}])(
        'should validate address',
        ({country, type}) =>
            expect(shouldValidateAddress(country, type)).toBe(true)
    )
})

describe('getAvailableStates()', () => {
    it('should only include a selected list of states', () => {
        expect(
            getAvailableStates('US').find((state) => state.name === 'New York')
        ).toBeDefined()
        expect(
            getAvailableStates('US').find(
                (state) => state.name === 'New Hampshire'
            )
        ).toBeUndefined()
    })

    it('should only include US states', () => {
        expect(getAvailableStates('CA')).toEqual([])
    })
})

describe('getAddressValidationAlertMessage', () => {
    it('should not return anything when country is not selected', () => {
        expect(getAddressValidationAlertMessage()).toBeNull()
    })

    it('should not return anything when country is AU and type is not mobile', () => {
        expect(getAddressValidationAlertMessage(PhoneCountry.AU)).toBeNull()
    })

    it('should return a message when country is AU and type is mobile', () => {
        expect(
            getAddressValidationAlertMessage(PhoneCountry.AU, PhoneType.Mobile)
        ).toEqual(validationAlertMessages[PhoneCountry.AU])
    })

    it.each([
        PhoneCountry.GB,
        PhoneCountry.FR,
        PhoneCountry.DE,
        PhoneCountry.NZ,
    ])(
        'should return alert message for selected country',
        (country: PhoneCountry) => {
            expect(getAddressValidationAlertMessage(country)).toEqual(
                validationAlertMessages[country]
            )
        }
    )
})
