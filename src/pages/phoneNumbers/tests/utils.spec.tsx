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
} from '../utils'

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
