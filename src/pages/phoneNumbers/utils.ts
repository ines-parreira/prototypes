import {has, isEmpty} from 'lodash'
import {CountryCode} from 'libphonenumber-js'
import {
    PhoneNumber,
    PhoneCountry,
    PhoneCapabilities,
    NewPhoneNumber,
    OldPhoneNumber,
} from 'models/phoneNumber/types'

import {IntegrationType} from 'models/integration/types'
import rawCountries from 'pages/phoneNumbers/options/countries.json'
import {getCountryFromPhoneNumber} from 'pages/common/forms/PhoneNumberInput/utils'

const CAPABILITY_KEY: Record<
    IntegrationType.Sms | IntegrationType.Phone,
    keyof PhoneCapabilities
> = {
    [IntegrationType.Sms]: 'sms',
    [IntegrationType.Phone]: 'voice',
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
    integrationType: IntegrationType.Sms | IntegrationType.Phone
): boolean {
    return !!phoneNumber.capabilities[CAPABILITY_KEY[integrationType]]
}

export function countryCode(
    number: PhoneNumber | NewPhoneNumber
): Maybe<CountryCode> {
    if (isWhatsAppNumber(number)) {
        return getCountryFromPhoneNumber(number.phone_number)
    }

    if (isTwilioNumber(number)) {
        return number.twilio_phone_number?.country
    }

    return number.meta.country
}

export function friendlyName(phoneNumber: PhoneNumber | NewPhoneNumber) {
    return isNewPhoneNumber(phoneNumber)
        ? phoneNumber.phone_number_friendly
        : phoneNumber.meta.friendly_name
}

export function isNewPhoneNumber(
    number: PhoneNumber | NewPhoneNumber
): number is NewPhoneNumber {
    return (
        has(number, 'whatsapp_phone_number') &&
        has(number, 'twilio_phone_number')
    )
}

export function isOldPhoneNumber(
    number: PhoneNumber | NewPhoneNumber
): number is OldPhoneNumber {
    return !isNewPhoneNumber(number)
}

export function isWhatsAppNumber(
    number: PhoneNumber | NewPhoneNumber
): number is NewPhoneNumber {
    return isNewPhoneNumber(number) && !isEmpty(number.whatsapp_phone_number)
}

export function isTwilioNumber(
    number: PhoneNumber | NewPhoneNumber
): number is NewPhoneNumber {
    return isNewPhoneNumber(number) && !isEmpty(number.twilio_phone_number)
}
