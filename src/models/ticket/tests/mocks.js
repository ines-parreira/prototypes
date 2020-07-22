//@flow
import type {Action, TicketMessage} from '../types'
import {TicketMessageSourceTypes} from '../../../business/ticket'

export const message: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'email',
    via: 'email',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
}

export const facebookMessageNoMeta: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'facebook',
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceTypes.FACEBOOK_COMMENT,
    },
}

export const facebookMessageWithCustomerReaction: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'facebook',
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceTypes.FACEBOOK_COMMENT,
    },
    meta: {
        facebook_reactions: {
            customer_reaction: {
                reaction_type: 'love',
                reaction_made_by: 'Cust Omer',
                reaction_datetime: '2020-06-17T14:10:14.291746',
            },
            reactions_counter: {
                wow: 1,
                like: 2,
                love: 2,
                total_reactions: 5,
            },
        },
    },
}

export const facebookMessageWithPageReaction: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'facebook',
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '2020-06-17T08:31:10+00:00',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceTypes.FACEBOOK_COMMENT,
    },
    meta: {
        facebook_reactions: {
            page_reaction: {
                reaction_type: 'like',
                reaction_datetime: '2020-06-17T14:10:14.291746',
            },
            reactions_counter: {
                wow: 1,
                like: 2,
                love: 2,
                total_reactions: 5,
            },
        },
    },
}

export const facebookMessageWithPageAndCustomerReactions: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'facebook',
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    meta: {
        facebook_reactions: {
            page_reaction: {
                reaction_type: 'like',
                reaction_datetime: '2020-06-17T14:10:14.291746',
            },
            customer_reaction: {
                reaction_type: 'wow',
                reaction_made_by: 'Cust Omer',
                reaction_datetime: '2020-06-17T13:10:14.291746',
            },
            reactions_counter: {
                wow: 1,
                like: 2,
                love: 2,
                total_reactions: 5,
            },
        },
    },
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceTypes.FACEBOOK_COMMENT,
    },
}

export const hiddenFacebookMessage: TicketMessage = {
    id: 1,
    sender: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
    },
    receiver: {
        id: 2,
        email: 'mary.poppins@example.com',
        name: 'Mary Poppins',
        firstname: 'Mary',
        lastname: 'Poppins',
    },
    subject: 'Some subject',
    channel: 'facebook',
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    meta: {
        hidden_datetime: '2020-06-18T14:10:14.291746',
        facebook_reactions: {
            page_reaction: {
                reaction_type: 'like',
                reaction_datetime: '2020-06-17T14:10:14.291746',
            },
            customer_reaction: {
                reaction_type: 'wow',
                reaction_made_by: 'Cust Omer',
                reaction_datetime: '2020-06-17T13:10:14.291746',
            },
            reactions_counter: {
                wow: 1,
                like: 2,
                love: 2,
                total_reactions: 5,
            },
        },
    },
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceTypes.FACEBOOK_COMMENT,
    },
}

export const action: Action = {
    status: 'success',
    name: 'foo',
    title: '',
    type: 'user',
}
