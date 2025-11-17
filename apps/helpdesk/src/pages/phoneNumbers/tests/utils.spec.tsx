import { render } from '@testing-library/react'

import { phoneNumbers } from 'fixtures/phoneNumber'
import { IntegrationType } from 'models/integration/types'
import type { NewPhoneNumber, OldPhoneNumber } from 'models/phoneNumber/types'
import {
    PhoneConnectionType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'

import {
    buildInternationalNumber,
    countryCode,
    formatAsNationalNumber,
    formatPhoneNumberInternational,
    friendlyName,
    getAddressValidationAlertMessage,
    getAvailableStates,
    getCountryCapabilityLimitationsMessage,
    getCountryFromPhoneNumber,
    getFirstAvailableType,
    getLimitationsMessageForType,
    getPhoneTypeOptions,
    hasCapability,
    isNewPhoneNumber,
    isTwilioNumber,
    isWhatsAppNumber,
    normalizeNumber,
    shouldDisplayType,
    shouldValidateAddress,
} from '../utils'

describe('isNewPhoneNumber()', () => {
    it('returns true if the number is of the new structure', () => {
        expect(
            isNewPhoneNumber({
                connections: [],
            } as unknown as NewPhoneNumber),
        ).toBe(true)
    })

    it('returns true if the number is of the new structure', () => {
        expect(
            isNewPhoneNumber({
                meta: {},
            } as OldPhoneNumber),
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
            } as NewPhoneNumber),
        ).toBe(true)
    })

    it('returns false if the number does not have whatsapp meta', () => {
        expect(
            isWhatsAppNumber({
                connections: [],
            } as unknown as NewPhoneNumber),
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
            } as NewPhoneNumber),
        ).toBe(true)
    })

    it('returns false if the number does not have twilio meta', () => {
        expect(
            isTwilioNumber({
                connections: [],
            } as unknown as NewPhoneNumber),
        ).toBe(false)
    })
})

describe('hasCapability()', () => {
    it("maps integration type to a given phone number's capabilities", () => {
        const numberWithBothCapabilities = phoneNumbers[0]
        const numberWithoutSmsCapability = phoneNumbers[2]
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Phone),
        ).toEqual(true)
        expect(
            hasCapability(numberWithBothCapabilities, IntegrationType.Sms),
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Phone),
        ).toEqual(true)
        expect(
            hasCapability(numberWithoutSmsCapability, IntegrationType.Sms),
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
            } as NewPhoneNumber),
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
            } as NewPhoneNumber),
        ).toEqual(PhoneCountry.US)
    })

    it("returns the country provided by the backend if it's a (old format) twilio number", () => {
        expect(
            countryCode({
                meta: {
                    country: PhoneCountry.US,
                },
            } as OldPhoneNumber),
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
            } as OldPhoneNumber),
        ).toEqual('+123')
    })

    it('returns the friendly name for a new format number', () => {
        expect(
            friendlyName({
                phone_number_friendly: '+123',
                connections: [],
            } as unknown as NewPhoneNumber),
        ).toEqual('+123')
    })
})

describe('buildInternationalNumber()', () => {
    it('should return unformatted numbers in international format', () => {
        expect(buildInternationalNumber('234 567 8910', 'US')).toEqual(
            '+12345678910',
        )
        expect(buildInternationalNumber('2 34 56 78 91', 'FR')).toEqual(
            '+33234567891',
        )
    })

    it("should use the given country's calling code if given an international number", () => {
        expect(buildInternationalNumber('+1 234 567 8910', 'FR')).toEqual(
            '+332345678910',
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
        },
    )

    it.each([
        ['33 2 34 56 78 91', '33 2 34 56 78 91'],
        ['1234 567 8910', '1234 567 8910'],
    ])(
        'should return the given number if not in international format',
        (number, nationalNumber) => {
            expect(formatAsNationalNumber(number)).toEqual(nationalNumber)
        },
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
        },
    )
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
        },
    )
})

describe('shouldValidateAddress()', () => {
    it.each([
        { country: PhoneCountry.AU, type: PhoneType.Local },
        { country: PhoneCountry.CZ, type: PhoneType.National },
        { country: PhoneCountry.FI, type: PhoneType.Mobile },
        { country: PhoneCountry.IE, type: PhoneType.Local },
        { country: PhoneCountry.NL, type: PhoneType.Mobile },
        { country: PhoneCountry.SE, type: PhoneType.Mobile },
    ])('should validate address for $country $type', ({ country, type }) =>
        expect(shouldValidateAddress(country, type)).toBe(true),
    )

    it.each([
        { country: PhoneCountry.US },
        { country: PhoneCountry.CA },
        { country: PhoneCountry.FR },
        { country: PhoneCountry.GB },
        { country: PhoneCountry.DE },
        { country: PhoneCountry.NZ },
        { country: PhoneCountry.AU, type: PhoneType.Mobile },
        { country: PhoneCountry.CZ, type: PhoneType.Local },
        { country: PhoneCountry.FI, type: PhoneType.Local },
        { country: PhoneCountry.IL, type: PhoneType.Local },
        { country: PhoneCountry.IL, type: PhoneType.National },
        { country: PhoneCountry.NL, type: PhoneType.Local },
        { country: PhoneCountry.NL, type: PhoneType.National },
        { country: PhoneCountry.SE, type: PhoneType.Local },
        { country: PhoneCountry.SE, type: PhoneType.National },
    ])('should not validate address for $country $type', ({ country, type }) =>
        expect(shouldValidateAddress(country, type)).toBe(false),
    )
})

describe('getAvailableStates()', () => {
    it('should only include a selected list of states', () => {
        expect(
            getAvailableStates('US').find((state) => state.name === 'New York'),
        ).toBeDefined()
        expect(
            getAvailableStates('US').find(
                (state) => state.name === 'American Samoa',
            ),
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

    it('should return null when self-service is available', () => {
        expect(
            getAddressValidationAlertMessage(PhoneCountry.US, PhoneType.Local),
        ).toBeNull()
    })

    it('should return JSX message for AU Mobile type (not self-service available)', () => {
        const result = getAddressValidationAlertMessage(
            PhoneCountry.AU,
            PhoneType.Mobile,
        )

        const { getByText } = render(<div>{result}</div>)
        expect(
            getByText('Submit a request for Australian mobile phone numbers', {
                exact: false,
            }),
        ).toBeInTheDocument()
    })

    it('should not return anything when selected type is self-service supported and the others not', () => {
        expect(
            getAddressValidationAlertMessage(PhoneCountry.AU, PhoneType.Local),
        ).toBeNull()
    })

    it('should return correct message for countries with 2 types supported via typeform', () => {
        const result = getAddressValidationAlertMessage(
            PhoneCountry.BE,
            PhoneType.Local,
        )

        const { getByText } = render(<div>{result}</div>)
        expect(
            getByText(
                'Submit a request for Belgian local and mobile phone numbers',
                {
                    exact: false,
                },
            ),
        ).toBeInTheDocument()
    })

    it('should return correct message for countries with 3 types supported via typeform', () => {
        const result = getAddressValidationAlertMessage(PhoneCountry.FR)

        const { getByText } = render(<div>{result}</div>)
        expect(
            getByText(
                'Submit a request for French local, national and mobile phone numbers',
                {
                    exact: false,
                },
            ),
        ).toBeInTheDocument()
    })
})

describe('getPhoneTypeOptions', () => {
    it('should return empty array when country is not selected', () => {
        expect(getPhoneTypeOptions()).toEqual([])
    })

    it('should return correct options for US', () => {
        expect(getPhoneTypeOptions(PhoneCountry.US)).toEqual([
            { value: PhoneType.Local, label: 'Local' },
            { value: PhoneType.TollFree, label: 'Toll-free' },
        ])
    })
})

describe('shouldDisplayType', () => {
    it('should return false when country is not selected', () => {
        expect(shouldDisplayType()).toBe(false)
    })

    it('should return true when country is selected and has self-service types', () => {
        expect(shouldDisplayType(PhoneCountry.US)).toBe(true)
    })

    it('should return false when country is selected and has no self-service types', () => {
        expect(shouldDisplayType(PhoneCountry.NZ)).toBe(false)
    })
})

describe('getLimitationsMessageForType', () => {
    it('should return null if there are no limitations', () => {
        expect(
            getLimitationsMessageForType(PhoneCountry.US, PhoneType.Local, {
                [PhoneType.Local]: {
                    sms: true,
                    mms: true,
                    voice: true,
                    whatsapp: true,
                },
            }),
        ).toBeNull()
    })

    it('should return message for a specific type', () => {
        expect(
            getLimitationsMessageForType(PhoneCountry.CH, PhoneType.Local, {
                [PhoneType.Local]: {
                    sms: false,
                    mms: true,
                    voice: false,
                    whatsapp: true,
                },
            }),
        ).toBe(
            'Local - Voice and SMS are not currently compatible with local Swiss numbers',
        )
    })
})

describe('getFirstAvailableType', () => {
    it('should return the first available type', () => {
        expect(getFirstAvailableType(PhoneCountry.US)).toBe(PhoneType.Local)
    })

    it('should return undefined if there are no available types', () => {
        expect(getFirstAvailableType(PhoneCountry.NZ)).toBeUndefined()
    })
})

describe('getCountryCapabilityLimitationsMessage', () => {
    it('should return an empty array if there are no limitations', () => {
        expect(
            getCountryCapabilityLimitationsMessage(PhoneCountry.US, {
                [PhoneType.Local]: {
                    sms: true,
                    mms: true,
                    voice: true,
                    whatsapp: true,
                },
            }),
        ).toEqual([])
    })

    it('should return a message for a specific country', () => {
        expect(
            getCountryCapabilityLimitationsMessage(PhoneCountry.ZA, {
                [PhoneType.Local]: {
                    sms: false,
                    mms: false,
                    voice: false,
                    whatsapp: false,
                },
                [PhoneType.National]: {
                    sms: false,
                    mms: false,
                    voice: true,
                    whatsapp: false,
                },
                [PhoneType.Mobile]: {
                    sms: true,
                    mms: false,
                    voice: true,
                    whatsapp: false,
                },
            }),
        ).toEqual([
            'Voice is not currently compatible with local numbers from South Africa',
            'SMS is not currently compatible with local and national numbers from South Africa',
            'MMS is not currently compatible with local, national and mobile numbers from South Africa',
        ])
    })

    it('should only specify the supported by default types for a country', () => {
        expect(
            getCountryCapabilityLimitationsMessage(PhoneCountry.CH, {
                [PhoneType.Local]: {
                    sms: false,
                    mms: false,
                    voice: true,
                    whatsapp: false,
                },
                [PhoneType.Mobile]: {
                    sms: false,
                    mms: false,
                    voice: false,
                    whatsapp: false,
                },
            }),
        ).toEqual([
            'SMS is not currently compatible with local numbers from Switzerland',
            'MMS is not currently compatible with local numbers from Switzerland',
        ])
    })
})
