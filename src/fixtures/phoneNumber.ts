import {
    OldPhoneNumber,
    PhoneType,
    PhoneCountry,
    AddressType,
    PhoneCapabilitiesLimitationsMap,
} from 'models/phoneNumber/types'

export const phoneNumbers: OldPhoneNumber[] = [
    {
        id: 1,
        name: 'A Phone Number',
        phone_number: '+14151112222',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        meta: {
            type: PhoneType.Local,
            emoji: '👍',
            friendly_name: '+1 415 111 2222',
            state: 'CA',
            country: PhoneCountry.US,
            area_code: 415,
        },
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
        },
    },
    {
        id: 2,
        name: 'Another Phone Number',
        phone_number: '+14151112223',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        meta: {
            type: PhoneType.TollFree,
            emoji: '👍',
            friendly_name: '+1 813 111 2223',
            country: PhoneCountry.CA,
            area_code: 813,
        },
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
        },
    },
    {
        id: 3,
        name: 'Intl. Phone Number',
        phone_number: '+14151112223',
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
            type: PhoneType.Mobile,
            emoji: '👍',
            friendly_name: '+44 7123 456789',
            country: PhoneCountry.GB,
            area_code: 7,
        },
        integrations: [],
        capabilities: {
            sms: false,
            voice: true,
            mms: false,
        },
    },
]

export const capabilities: PhoneCapabilitiesLimitationsMap = {
    AU: {
        Local: {
            mms: false,
            sms: false,
            voice: true,
        },
    },
    CA: {
        Local: {
            mms: true,
            sms: true,
            voice: true,
        },
        TollFree: {
            mms: true,
            sms: true,
            voice: true,
        },
    },
    GB: {
        Local: {
            mms: false,
            sms: true,
            voice: true,
        },
        Mobile: {
            mms: false,
            sms: true,
            voice: true,
        },
        National: {
            mms: false,
            sms: true,
            voice: true,
        },
    },
    US: {
        Local: {
            mms: true,
            sms: true,
            voice: true,
        },
        TollFree: {
            mms: true,
            sms: true,
            voice: true,
        },
    },
}
