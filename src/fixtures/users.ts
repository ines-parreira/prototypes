import {ADMIN_ROLE} from '../config/user'
import {User, UserSettingType} from '../config/types/user'

export const user: User = {
    lastname: 'Plugaru',
    settings: [
        {
            data: {
                show_macros: true,
                available: true,
                hide_tips: true,
                forward_calls: false,
            },
            id: 3,
            type: UserSettingType.Preferences,
        },
    ],
    meta: {},
    active: true,
    deactivated_datetime: null,
    name: 'Alex Plugaru',
    bio: 'CTO',
    external_id: '2',
    created_datetime: '2016-12-22T19:36:12.487448+00:00',
    country: 'US',
    language: 'en',
    timezone: 'EST',
    id: 2,
    firstname: 'Alex',
    email: 'alex@gorgias.io',
    roles: [
        {
            name: ADMIN_ROLE,
        },
    ],
    updated_datetime: '2016-12-22T19:36:12.489432+00:00',
}
