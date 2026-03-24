import type { PhoneUseCase } from 'business/twilio'
import { PhoneCountry, PhoneFunction, PhoneType } from 'business/twilio'
import type { Integration } from 'models/integration/types'

export type PhoneNumber = OldPhoneNumber | NewPhoneNumber

export type OldPhoneNumber = {
    id: number
    name: string
    phone_number: string
    phone_number_id: number
    address?: AddressInformation
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
    integrations: IntegrationPreview[]
    capabilities: PhoneCapabilities
    meta: PhoneNumberMeta
    usecase?: PhoneUseCase
}

export type NewPhoneNumber = {
    id: number
    name: string
    phone_number: string
    phone_number_friendly: string
    connections: PhoneConnection[]
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
    integrations: IntegrationPreview[]
    capabilities: PhoneCapabilities
    whatsapp_phone_number?: {
        waba_id: string
        waba_phone_number_id: string
    }
    twilio_phone_number?: TwilioPhoneNumberMeta
    usecase?: PhoneUseCase
}

export type TwilioPhoneNumberMeta = {
    type: PhoneType
    address: {
        country: PhoneCountry
        state?: Maybe<string>
        area_code: number
    }
}

export enum PhoneConnectionType {
    WhatsApp = 'whatsapp',
    Twilio = 'twilio',
}

export type PhoneConnection = WhatsAppPhoneConnection | TwilioPhoneConnection

export type WhatsAppPhoneConnection = {
    type: PhoneConnectionType.WhatsApp
    meta: WhatsAppPhoneNumberMeta
}

export type TwilioPhoneConnection = {
    type: PhoneConnectionType.Twilio
    meta: TwilioPhoneNumberMeta
}

export type WhatsAppPhoneNumberMeta = {
    waba_phone_number_id: string
}

export type PhoneNumberMeta = {
    emoji: Maybe<string>
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
    whatsapp: boolean
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

export type CountryPhoneCapabilities = {
    [key in PhoneType]?: PhoneCapabilities
}
export type PhoneCapabilitiesLimitationsMap = {
    [key in PhoneCountry]?: CountryPhoneCapabilities
}

export { PhoneType, PhoneCountry, PhoneFunction }
