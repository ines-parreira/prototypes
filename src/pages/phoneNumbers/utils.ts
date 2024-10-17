import {has, get, toString, parseInt, join, startsWith} from 'lodash'
import parsePhoneNumber, {
    CountryCode,
    isValidPhoneNumber,
    formatIncompletePhoneNumber,
    getCountryCallingCode,
    Metadata,
} from 'libphonenumber-js'
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
    PhoneType,
} from 'models/phoneNumber/types'

import {IntegrationType} from 'models/integration/types'
import rawCountries from 'pages/phoneNumbers/options/countries.json'
import {State, states} from 'config/states'
import {validationAlertMessages} from './constants'

const CAPABILITY_KEY: Record<
    IntegrationType.Sms | IntegrationType.Phone | IntegrationType.WhatsApp,
    keyof PhoneCapabilities
> = {
    [IntegrationType.Sms]: 'sms',
    [IntegrationType.Phone]: 'voice',
    [IntegrationType.WhatsApp]: 'whatsapp',
}

const AVAILABLE_STATES: Record<string, string[]> = {
    US: [
        'AL',
        'AZ',
        'AR',
        'CA',
        'CO',
        'CT',
        'DE',
        'DC',
        'FL',
        'GA',
        'ID',
        'IL',
        'IN',
        'IA',
        'KS',
        'KY',
        'LA',
        'ME',
        'MD',
        'MA',
        'MI',
        'MN',
        'MS',
        'MO',
        'MT',
        'NE',
        'NV',
        'NJ',
        'NM',
        'NY',
        'NC',
        'ND',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VT',
        'VA',
        'WA',
        'WV',
        'WI',
    ],
}

export function shouldValidateAddress(
    country: PhoneCountry,
    type?: PhoneType
): boolean {
    return country === PhoneCountry.AU && type !== PhoneType.Mobile
}

export function getAvailableStates(country: string): State[] {
    const availableStates = AVAILABLE_STATES[country] ?? []
    return (states[country] ?? []).filter((state) =>
        availableStates.includes(state.code)
    )
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

export function formatPhoneNumberInternational(number?: string): string {
    if (!number) return ''

    return number && isValidPhoneNumber(number)
        ? (parsePhoneNumber(number)?.formatInternational() ?? '')
        : number
}

export function getCountryFromPhoneNumber(
    number: string
): CountryCode | undefined {
    const parsedNumber = parsePhoneNumber(number)

    if (parsedNumber?.country) {
        return parsedNumber.country
    }

    const metadata = new Metadata()
    const callingCodes = get(metadata, 'metadata.country_calling_codes')

    const callingCode = parsedNumber?.countryCallingCode ?? parseInt(number)

    if (callingCode) {
        return get(callingCodes, [
            toString(callingCode),
            0,
        ]) as unknown as CountryCode
    }

    return undefined
}

export function buildInternationalNumber(
    nationalNumber: string,
    country: CountryCode
): string {
    const callingCode = getCountryCallingCode(country)
    return normalizeNumber(
        join([
            '+',
            toString(callingCode),
            formatAsNationalNumber(nationalNumber, country),
        ])
    )
}

export function formatAsNationalNumber(
    number: string,
    country?: CountryCode
): string {
    if (!startsWith(number, '+')) {
        return number
    }
    const internationalFormatted = formatIncompletePhoneNumber(number, country)
    const segments = internationalFormatted.split(' ')
    segments.shift()
    return join(segments, ' ')
}

export function normalizeNumber(number: string): string {
    const cleanedNumber = number.replace(/[^0-9]/gi, '')
    if (number[0] === '+') {
        return `+${cleanedNumber}`
    }
    return cleanedNumber
}

export const getAddressValidationAlertMessage = (
    country?: PhoneCountry,
    type?: PhoneType
): React.JSX.Element | null => {
    const isAustralianLocalType =
        country === PhoneCountry.AU && type !== PhoneType.Mobile

    const alertMessage = country ? validationAlertMessages[country] : null

    if (!alertMessage || isAustralianLocalType) {
        return null
    }

    return alertMessage
}
