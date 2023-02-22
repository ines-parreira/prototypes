import {
    PhoneType,
    PhoneCountry,
    PhoneConnectionType,
    NewPhoneNumber,
} from 'models/phoneNumber/types'

export const phoneNumbers: NewPhoneNumber[] = [
    {
        id: 1,
        name: 'A Phone Number',
        phone_number: '+14151112222',
        phone_number_friendly: '+1 415 111 2222',
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
    },
    {
        id: 2,
        name: 'Another Phone Number',
        phone_number: '+14151112223',
        phone_number_friendly: '+1 813 111 2223',
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
    },
    {
        id: 3,
        name: 'Intl. Phone Number',
        phone_number: '+14151112223',
        phone_number_friendly: '+1 4151 11 2223',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        connections: [
            {
                type: PhoneConnectionType.Twilio,
                meta: {
                    type: PhoneType.Mobile,
                    address: {
                        country: PhoneCountry.CA,
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
    },
]
