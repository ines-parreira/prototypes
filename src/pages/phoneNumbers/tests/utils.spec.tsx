import {IntegrationType} from 'models/integration/types'
import {phoneNumbers} from 'fixtures/phoneNumber'
import {
    NewPhoneNumber,
    OldPhoneNumber,
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
                whatsapp_phone_number: {},
                twilio_phone_number: {},
            } as NewPhoneNumber)
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
                whatsapp_phone_number: {
                    routing: {
                        phone_number: '123',
                    },
                },
                twilio_phone_number: {},
            } as NewPhoneNumber)
        ).toBe(true)
    })

    it('returns false if the number does not have whatsapp meta', () => {
        expect(
            isWhatsAppNumber({
                whatsapp_phone_number: {},
                twilio_phone_number: {},
            } as NewPhoneNumber)
        ).toBe(false)
    })
})

describe('isTwilioNumber()', () => {
    it('returns true if the number has twilio meta', () => {
        expect(
            isTwilioNumber({
                whatsapp_phone_number: {},
                twilio_phone_number: {
                    type: PhoneType.Local,
                },
            } as NewPhoneNumber)
        ).toBe(true)
    })

    it('returns false if the number does not have twilio meta', () => {
        expect(
            isTwilioNumber({
                whatsapp_phone_number: {},
                twilio_phone_number: {},
            } as NewPhoneNumber)
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
                phone_number: '+1 234 567 8910',
                whatsapp_phone_number: {
                    routing: {
                        phone_number: '+1 234 567 8910',
                    },
                },
                twilio_phone_number: {},
            } as NewPhoneNumber)
        ).toEqual('US')
    })

    it("returns the country provided by the backend if it's a (new format) twilio number", () => {
        expect(
            countryCode({
                twilio_phone_number: {
                    country: PhoneCountry.US,
                },
                whatsapp_phone_number: {},
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
                whatsapp_phone_number: {},
                twilio_phone_number: {},
            } as NewPhoneNumber)
        ).toEqual('+123')
    })
})
