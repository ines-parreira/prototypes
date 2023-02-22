import {has} from 'lodash'
import {CountryCode} from 'libphonenumber-js'
import {
    PhoneNumber,
    PhoneCountry,
    PhoneCapabilities,
    NewPhoneNumber,
    OldPhoneNumber,
    PhoneConnectionType,
    PhoneConnection,
    TwilioPhoneConnection,
    WhatsAppPhoneConnection,
} from 'models/phoneNumber/types'

import {IntegrationType} from 'models/integration/types'
import rawCountries from 'pages/phoneNumbers/options/countries.json'
import {getCountryFromPhoneNumber} from 'pages/common/forms/PhoneNumberInput/utils'

const CAPABILITY_KEY: Record<
    IntegrationType.Sms | IntegrationType.Phone | IntegrationType.WhatsApp,
    keyof PhoneCapabilities
> = {
    [IntegrationType.Sms]: 'sms',
    [IntegrationType.Phone]: 'voice',
    [IntegrationType.WhatsApp]: 'whatsapp',
}

export function shouldValidateAddress(country: PhoneCountry): boolean {
    return country === PhoneCountry.GB || country === PhoneCountry.AU
}

export function countryName(country: PhoneCountry): string {
    const countryOption = rawCountries.find((c) => c.value === country)
    if (countryOption) {
        return countryOption.label
    }

    return country
}

export function hasCapability(
    phoneNumber: PhoneNumber,
    integrationType:
        | IntegrationType.Sms
        | IntegrationType.Phone
        | IntegrationType.WhatsApp
): boolean {
    return !!phoneNumber.capabilities[CAPABILITY_KEY[integrationType]]
}

export function countryCode(number: PhoneNumber): Maybe<CountryCode> {
    if (isTwilioNumber(number)) {
        return number.connections.find(isTwilioConnection)?.meta.address.country
    }

    if (isWhatsAppNumber(number)) {
        return getCountryFromPhoneNumber(number.phone_number)
    }

    if (isOldPhoneNumber(number)) {
        return number.meta.country
    }
}

export function friendlyName(phoneNumber: PhoneNumber) {
    return isNewPhoneNumber(phoneNumber)
        ? phoneNumber.phone_number_friendly
        : phoneNumber.meta.friendly_name
}

export function isNewPhoneNumber(
    number: PhoneNumber
): number is NewPhoneNumber {
    return has(number, 'connections')
}

export function isOldPhoneNumber(
    number: PhoneNumber
): number is OldPhoneNumber {
    return !isNewPhoneNumber(number)
}

export function isWhatsAppNumber(
    number: PhoneNumber
): number is NewPhoneNumber {
    return (
        isNewPhoneNumber(number) &&
        number.connections.some(isWhatsAppConnection)
    )
}

export function isTwilioNumber(number: PhoneNumber): number is NewPhoneNumber {
    return (
        isNewPhoneNumber(number) && number.connections.some(isTwilioConnection)
    )
}

export function isTwilioConnection(
    connection: PhoneConnection
): connection is TwilioPhoneConnection {
    return connection.type === PhoneConnectionType.Twilio
}

export function isWhatsAppConnection(
    connection: PhoneConnection
): connection is WhatsAppPhoneConnection {
    return connection.type === PhoneConnectionType.WhatsApp
}
