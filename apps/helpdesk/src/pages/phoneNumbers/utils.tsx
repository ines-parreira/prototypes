import type { CountryCode } from 'libphonenumber-js'
import parsePhoneNumber, {
    formatIncompletePhoneNumber,
    getCountryCallingCode,
    isValidPhoneNumber,
    Metadata,
} from 'libphonenumber-js'
import { get, has, join, parseInt, startsWith, toString } from 'lodash'

import {
    CAPABILITY_TYPE_LABELS,
    PHONE_TYPE_LABELS,
    phoneCountryConfig,
} from 'business/twilio'
import type { State } from 'config/states'
import { states } from 'config/states'
import { IntegrationType } from 'models/integration/types'
import type {
    CountryPhoneCapabilities,
    NewPhoneNumber,
    OldPhoneNumber,
    PhoneCapabilities,
    PhoneConnection,
    PhoneCountry,
    PhoneNumber,
    PhoneType,
    TwilioPhoneConnection,
    WhatsAppPhoneConnection,
} from 'models/phoneNumber/types'
import { PhoneConnectionType } from 'models/phoneNumber/types'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'

import { PHONE_NUMBER_TYPEFORM_URL } from './constants'

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
        'AK',
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
        'HI',
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
        'NH',
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
        'WY',
    ],
}

export function shouldValidateAddress(
    country: PhoneCountry,
    type?: PhoneType,
): boolean {
    const phoneTypeConfig = phoneCountryConfig[country].phoneTypeConfig

    if (!phoneTypeConfig || !type) {
        return false
    }

    return !!phoneTypeConfig[type]?.addressValidation
}

export function getAvailableStates(country: string): State[] {
    const availableStates = AVAILABLE_STATES[country] ?? []
    return (states[country] ?? []).filter((state) =>
        availableStates.includes(state.code),
    )
}

export function hasCapability(
    phoneNumber: PhoneNumber,
    integrationType:
        | IntegrationType.Sms
        | IntegrationType.Phone
        | IntegrationType.WhatsApp,
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
    number: PhoneNumber,
): number is NewPhoneNumber {
    return has(number, 'connections')
}

export function isOldPhoneNumber(
    number: PhoneNumber,
): number is OldPhoneNumber {
    return !isNewPhoneNumber(number)
}

export function isWhatsAppNumber(
    number: PhoneNumber,
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
    connection: PhoneConnection,
): connection is TwilioPhoneConnection {
    return connection.type === PhoneConnectionType.Twilio
}

export function isWhatsAppConnection(
    connection: PhoneConnection,
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
    number: string,
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
    country: CountryCode,
): string {
    const callingCode = getCountryCallingCode(country)
    return normalizeNumber(
        join([
            '+',
            toString(callingCode),
            formatAsNationalNumber(nationalNumber, country),
        ]),
    )
}

export function formatAsNationalNumber(
    number: string,
    country?: CountryCode,
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

const listPhoneTypesForTypeform = (country: PhoneCountry) => {
    const unavailableForSelfService = Object.keys(
        phoneCountryConfig[country].phoneTypeConfig,
    ).filter(
        (type) =>
            !phoneCountryConfig[country].phoneTypeConfig[type as PhoneType]
                ?.selfService,
    )

    const listedTypes = unavailableForSelfService.map((type) =>
        type.toLowerCase(),
    )

    return formatListAsText(listedTypes)
}

export const shouldDisplayType = (country?: PhoneCountry): boolean => {
    if (!country) {
        return false
    }

    const hasSelfServiceTypes = Object.values(
        phoneCountryConfig[country].phoneTypeConfig,
    ).some((type) => type.selfService)

    return hasSelfServiceTypes
}

export const getAddressValidationAlertMessage = (
    country?: PhoneCountry,
    type?: PhoneType,
): React.JSX.Element | string | null => {
    if (!country) {
        return null
    }

    const isSelfServiceAvailable =
        type && phoneCountryConfig[country].phoneTypeConfig?.[type]?.selfService

    if (!isSelfServiceAvailable) {
        const message = (
            <>
                {`Submit a request for ${phoneCountryConfig[country].adjective} ${listPhoneTypesForTypeform(country)} phone numbers through the `}
                <a
                    href={PHONE_NUMBER_TYPEFORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    phone numbers request form
                </a>
                .
            </>
        )
        return message
    }

    return null
}

export function getPhoneTypeOptions(
    country?: PhoneCountry,
): SelectableOption[] {
    if (!country) {
        return []
    }

    const phoneTypeConfig = phoneCountryConfig[country].phoneTypeConfig

    return Object.keys(phoneTypeConfig)
        .filter((key): key is PhoneType => key in PHONE_TYPE_LABELS)
        .map((type) => ({
            value: type,
            label: PHONE_TYPE_LABELS[type],
        }))
}

export function getLimitationsMessageForType(
    country: PhoneCountry,
    type: PhoneType,
    capLimitations: CountryPhoneCapabilities,
): string | null {
    const limitations = capLimitations[type]

    const capabilityKeys = ['voice', 'sms', 'mms'] as const
    const missingCap = capabilityKeys
        .filter((capability) => !limitations?.[capability])
        .map((capability) => CAPABILITY_TYPE_LABELS[capability])

    if (missingCap.length === 0) {
        return null
    }

    return `${PHONE_TYPE_LABELS[type]} - ${missingCap.join(' and ')} ${missingCap.length === 1 ? 'is' : 'are'} not currently compatible with ${PHONE_TYPE_LABELS[type].toLowerCase()} ${phoneCountryConfig[country].adjective} numbers`
}

export function getCountryCapabilityLimitationsMessage(
    country: PhoneCountry,
    capLimitations: CountryPhoneCapabilities,
): string[] {
    const limitations: Record<string, string[]> = {
        voice: [],
        sms: [],
        mms: [],
    }

    for (const [type, capabilities] of Object.entries(capLimitations)) {
        if (
            phoneCountryConfig[country].phoneTypeConfig[type as PhoneType] !==
            undefined
        ) {
            if (!capabilities.mms) {
                limitations.mms.push(type.toLowerCase())
            }
            if (!capabilities.sms) {
                limitations.sms.push(type.toLowerCase())
            }
            if (!capabilities.voice) {
                limitations.voice.push(type.toLowerCase())
            }
        }
    }
    const formattedLimitations = []

    if (limitations.voice.length > 0) {
        formattedLimitations.push(
            `Voice is not currently compatible with ${formatListAsText(limitations.voice)} numbers from ${phoneCountryConfig[country].name}`,
        )
    }

    if (limitations.sms.length > 0) {
        formattedLimitations.push(
            `SMS is not currently compatible with ${formatListAsText(limitations.sms)} numbers from ${phoneCountryConfig[country].name}`,
        )
    }

    if (limitations.mms.length > 0) {
        formattedLimitations.push(
            `MMS is not currently compatible with ${formatListAsText(limitations.mms)} numbers from ${phoneCountryConfig[country].name}`,
        )
    }

    return formattedLimitations
}

function formatListAsText(items: string[]) {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0]
    if (items.length === 2) return `${items[0]} and ${items[1]}`

    const lastItem = items[items.length - 1]
    const otherItems = items.slice(0, items.length - 1)
    return `${otherItems.join(', ')} and ${lastItem}`
}

export const getFirstAvailableType = (
    country: PhoneCountry,
): PhoneType | undefined => {
    const phoneTypeConfig = phoneCountryConfig[country].phoneTypeConfig
    return Object.keys(phoneTypeConfig).find(
        (type) => phoneTypeConfig[type as PhoneType]?.selfService,
    ) as PhoneType | undefined
}
