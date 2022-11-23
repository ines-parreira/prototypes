import {Team} from '../state/teams/types'

export const teams: Team[] = [
    {
        created_datetime: '2021-10-28T13:59:55.322780+00:00',
        decoration: {},
        description: null,
        id: 33,
        members: [
            {
                email: 'foo@gorgias.com',
                id: 182267,
                meta: {
                    name_set_via: 'agent',
                },
                name: 'Foo',
            },
        ],
        name: 'Foo',
        uri: '/api/teams/33/',
    },
    {
        created_datetime: '2021-11-22T11:41:08.133256+00:00',
        decoration: {},
        description:
            'Default team, which was created for phone tickets auto-assignment.',
        id: 34,
        members: [
            {
                email: 'bar@gorgias.io',
                id: 2,
                meta: {},
                name: 'John Doe',
            },
        ],
        name: 'Phone team - +1 205-396-3441',
        uri: '/api/teams/34/',
    },
    {
        created_datetime: '2021-11-23T10:12:02.463745+00:00',
        decoration: {},
        description: null,
        id: 35,
        members: [
            {
                email: 'doe@gorgias.io',
                id: 3,
                meta: null,
                name: 'John Bar',
            },
        ],
        name: 'Team: user meta null',
        uri: '/api/teams/35/',
    },
    {
        created_datetime: '2021-11-24T15:01:09.788109+00:00',
        decoration: {},
        description: null,
        id: 36,
        members: [],
        name: 'test',
        uri: '/api/teams/36/',
    },
]
