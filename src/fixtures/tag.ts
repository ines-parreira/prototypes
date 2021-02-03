import {Tag} from '../models/tag/types'

export const tags = ([
    {
        id: 2,
        created_datetime: '2021-01-21T13:10:46.444928+00:00',
        decoration: null,
        deleted_datetime: null,
        description: null,
        name: 'billing',
        usage: 10,
        uri: '/api/tags/2/',
    },
    {
        id: 1,
        created_datetime: '2021-01-21T13:10:46.435364+00:00',
        decoration: null,
        deleted_datetime: null,
        description: null,
        name: 'refund',
        usage: 20,
        uri: '/api/tags/1/',
    },
    {
        id: 4,
        created_datetime: '2021-01-21T13:10:46.446673+00:00',
        decoration: null,
        deleted_datetime: null,
        description: null,
        name: 'refund accepted',
        usage: 0,
        uri: '/api/tags/4/',
    },
    {
        id: 3,
        created_datetime: '2021-01-21T13:10:46.445859+00:00',
        decoration: null,
        deleted_datetime: null,
        description: null,
        name: 'rejected',
        usage: 0,
        uri: '/api/tags/3/',
    },
] as unknown) as Tag[]
