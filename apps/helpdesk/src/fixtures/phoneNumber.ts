import type {
    OldPhoneNumber,
    PhoneCapabilitiesLimitationsMap,
} from 'models/phoneNumber/types'
import { AddressType, PhoneCountry, PhoneType } from 'models/phoneNumber/types'

export const phoneNumbers: OldPhoneNumber[] = [
    {
        id: 1,
        name: 'A Phone Number',
        phone_number: '+12133734253',
        phone_number_id: 1,
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        meta: {
            emoji: null,
            type: PhoneType.Local,
            friendly_name: '+1 213 373 4253',
            state: 'CA',
            country: PhoneCountry.US,
            area_code: 415,
        },
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
            whatsapp: true,
        },
    },
    {
        id: 2,
        name: 'Another Phone Number',
        phone_number: '+12133734255',
        phone_number_id: 2,
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        meta: {
            emoji: null,
            type: PhoneType.TollFree,
            friendly_name: '+1 213 373 4255',
            country: PhoneCountry.CA,
            area_code: 813,
        },
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
            whatsapp: true,
        },
    },
    {
        id: 3,
        name: 'Intl. Phone Number',
        phone_number: '+1 213 373 4253',
        phone_number_id: 3,
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        address: {
            address: 'SomethingVile, Somewhere',
            business_name: 'ACME',
            city: 'SomethingVile',
            country: PhoneCountry.GB,
            postal_code: '123',
            region: 'Somewhere',
            type: AddressType.Company,
        },
        meta: {
            emoji: null,
            type: PhoneType.Mobile,
            friendly_name: '+44 7123 456789',
            country: PhoneCountry.GB,
            area_code: 7,
        },
        integrations: [],
        capabilities: {
            sms: false,
            voice: true,
            mms: false,
            whatsapp: true,
        },
    },
]

export const capabilities: PhoneCapabilitiesLimitationsMap = {
    AU: {
        Local: {
            mms: false,
            sms: false,
            voice: true,
            whatsapp: true,
        },
    },
    CA: {
        Local: {
            mms: true,
            sms: true,
            voice: true,
            whatsapp: true,
        },
        TollFree: {
            mms: true,
            sms: true,
            voice: true,
            whatsapp: true,
        },
    },
    GB: {
        Local: {
            mms: false,
            sms: true,
            voice: true,
            whatsapp: true,
        },
        Mobile: {
            mms: false,
            sms: true,
            voice: true,
            whatsapp: true,
        },
        National: {
            mms: false,
            sms: true,
            voice: true,
            whatsapp: true,
        },
    },
    US: {
        Local: {
            mms: true,
            sms: true,
            voice: true,
            whatsapp: true,
        },
        TollFree: {
            mms: true,
            sms: true,
            voice: true,
            whatsapp: true,
        },
    },
}
