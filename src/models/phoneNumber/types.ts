import {PhoneType, PhoneCountry, PhoneFunction} from 'business/twilio'

export type PhoneNumber = {
    id: number
    name: string
    phone_number: string
    address?: AddressInformation
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
    meta: PhoneNumberMeta
}

export type PhoneNumberMeta = {
    emoji?: Maybe<string>
    country: PhoneCountry
    friendly_name: string
    type: PhoneType
    state?: Maybe<string>
    area_code: number
}

export type AddressInformation = {
    address: string
    business_name: string
    region: string
    postal_code: string
    city: string
    country: string
    type: AddressType
}

export enum AddressType {
    Company = 'company',
    Personal = 'personal',
}

export {PhoneType, PhoneCountry, PhoneFunction}
