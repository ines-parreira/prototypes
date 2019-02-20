import {ADMIN_ROLE, AGENT_ROLE, STAFF_ROLE} from '../config/user'

export const agents = [
    {
        lastname: 'Support',
        active: true,
        deactivated_datetime: null,
        name: 'Acme Support',
        external_id: '1',
        created_datetime: '2017-07-31T21:43:05.483835+00:00',
        id: 1,
        firstname: 'Acme',
        email: 'support@acme.gorgias.io',
        roles: [
            {
                name: AGENT_ROLE,
                id: 2
            },
            {
                name: ADMIN_ROLE,
                id: 3
            },
            {
                name: STAFF_ROLE,
                id: 4
            }
        ],
        updated_datetime: '2017-07-31T21:43:05.502541+00:00'
    },
    {
        lastname: 'Smith',
        active: true,
        deactivated_datetime: null,
        name: 'Bob Smith',
        external_id: '2',
        created_datetime: '2017-07-31T21:43:08.027035+00:00',
        id: 2,
        firstname: 'Bob',
        email: 'agent-smith@gorgias.io',
        roles: [
            {
                name: AGENT_ROLE,
                id: 2
            }
        ],
        updated_datetime: '2017-07-31T21:43:08.033390+00:00'
    }
]
export const locations = {
    1: {
        Ticket: [1, 2],
        Customer: [3]
    },
    2: {
        Ticket: [1],
        Customer: [2]
    }
}
export const typingStatuses = {
    1: {
        Ticket: [1, 2]
    },
    2: {
        Ticket: [1]
    }
}
