//@flow
import type {Action, TicketMessage} from '../types'

export const message: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe'
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins'
    },
    subject: 'Some subject',
    channel: 'email',
    via: 'email',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true
}

export const action: Action = {
    status: 'success',
    name: 'foo',
    title: '',
    type: 'user'
}
