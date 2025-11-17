import type { NewPhoneNumber } from 'models/phoneNumber/types'
import {
    PhoneConnectionType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'

export const phoneNumbers: NewPhoneNumber[] = [
    {
        id: 1,
        name: 'A Phone Number',
        phone_number: '+12133734253',
        phone_number_friendly: '+1 213 373 4253',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        connections: [
            {
                type: PhoneConnectionType.Twilio,
                meta: {
                    type: PhoneType.Local,
                    address: {
                        state: 'CA',
                        country: PhoneCountry.US,
                        area_code: 415,
                    },
                },
            },
        ],
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
            whatsapp: true,
        },
        twilio_phone_number: {
            type: PhoneType.Local,
            address: {
                state: 'CA',
                country: PhoneCountry.US,
                area_code: 415,
            },
        },
    },
    {
        id: 2,
        name: 'Another Phone Number',
        phone_number: '+12133734254',
        phone_number_friendly: '+1 213 373 4254',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        connections: [
            {
                type: PhoneConnectionType.Twilio,
                meta: {
                    type: PhoneType.TollFree,
                    address: {
                        country: PhoneCountry.CA,
                        area_code: 813,
                    },
                },
            },
        ],
        integrations: [],
        capabilities: {
            sms: true,
            voice: true,
            mms: true,
            whatsapp: true,
        },
        twilio_phone_number: {
            type: PhoneType.TollFree,
            address: {
                country: PhoneCountry.CA,
                area_code: 813,
            },
        },
    },
    {
        id: 3,
        name: 'Intl. Phone Number',
        phone_number: '+12133734255',
        phone_number_friendly: '+1 213 373 4255',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        connections: [
            {
                type: PhoneConnectionType.Twilio,
                meta: {
                    type: PhoneType.Mobile,
                    address: {
                        country: PhoneCountry.AU,
                        area_code: 813,
                    },
                },
            },
        ],
        integrations: [],
        capabilities: {
            sms: false,
            voice: true,
            mms: false,
            whatsapp: true,
        },
        twilio_phone_number: {
            type: PhoneType.Mobile,
            address: {
                country: PhoneCountry.AU,
                area_code: 813,
            },
        },
    },
]
