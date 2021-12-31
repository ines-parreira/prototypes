import {PhoneType, PhoneCountry, PhoneFunction} from 'models/phoneNumber/types'
export const phoneNumbers = [
    {
        id: 1,
        name: 'A Phone Number',
        phone_number: '+14151112222',
        created_datetime: '2021-12-01T18:00:00.000000+00:00',
        updated_datetime: '2021-12-01T18:00:00.000000+00:00',
        deleted_datetime: null,
        meta: {
            type: PhoneType.Local,
            function: PhoneFunction.Standard,
            emoji: '👍',
            friendly_name: '+1 415 111 2222',
            state: 'CA',
            country: PhoneCountry.US,
            area_code: 415,
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
            type: PhoneType.Local,
            function: PhoneFunction.Standard,
            emoji: '👍',
            friendly_name: '+1 415 111 2223',
            state: 'CA',
            country: PhoneCountry.US,
            area_code: 415,
        },
    },
]
