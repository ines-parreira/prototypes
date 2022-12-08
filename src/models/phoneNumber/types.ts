import {Integration} from 'models/integration/types'
import {PhoneType, PhoneCountry, PhoneFunction} from 'business/twilio'

export type PhoneNumber = OldPhoneNumber | NewPhoneNumber

export type OldPhoneNumber = {
    id: number
    name: string
    phone_number: string
    address?: AddressInformation
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
    integrations: IntegrationPreview[]
    capabilities: PhoneCapabilities
    meta: PhoneNumberMeta
}

export type NewPhoneNumber = {
    id: number
    name: string
    phone_number: string
    phone_number_friendly: Maybe<string>
    twilio_phone_number: TwilioPhoneNumberMeta
    whatsapp_phone_number: WhatsAppPhoneNumberMeta
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
    integrations: IntegrationPreview[]
    capabilities: PhoneCapabilities
}

export type TwilioPhoneNumberMeta = {
    type: PhoneType
    country: PhoneCountry
    state?: Maybe<string>
    area_code: number
}

export type WhatsAppPhoneNumberMeta = {
    routing: {
        phone_number: string
    }
}

export type PhoneNumberMeta = {
    emoji?: Maybe<string>
    country: PhoneCountry
    friendly_name: string
    type: PhoneType
    state?: Maybe<string>
    area_code: number
}

export type PhoneCapabilities = {
    mms: boolean
    sms: boolean
    voice: boolean
}

export type AddressInformation = {
    address: string
    business_name: string
    region: string
    postal_code: string
    city: string
    country: PhoneCountry
    type: AddressType
}

export enum AddressType {
    Company = 'company',
    Personal = 'personal',
}

export type IntegrationPreview = Pick<Integration, 'id' | 'type' | 'name'>

type CountryPhoneCapabilities = {[key in PhoneType]?: PhoneCapabilities}
export type PhoneCapabilitiesLimitationsMap = {
    [key in PhoneCountry]?: CountryPhoneCapabilities
}

export {PhoneType, PhoneCountry, PhoneFunction}
