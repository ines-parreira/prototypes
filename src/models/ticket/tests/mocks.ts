import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from '../../../business/types/ticket'
import {Action, ActionStatus, TicketMessage} from '../types'

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
    channel: TicketChannel.Email,
    via: TicketVia.Email,
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    rule_id: null,
    external_id: null,
    is_retriable: false,
    stripped_signature: null,
    actions: null,
    failed_datetime: null,
    opened_datetime: null,
    integration_id: null,
    meta: null,
    stripped_html: null,
    stripped_text: null,
    attachments: [],
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
    channel: TicketChannel.Facebook,
    via: TicketVia.Facebook,
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceType.FacebookComment,
    },
    stripped_signature: null,
    actions: null,
    rule_id: null,
    external_id: null,
    is_retriable: false,
    failed_datetime: null,
    opened_datetime: null,
    integration_id: null,
    meta: null,
    stripped_html: null,
    stripped_text: null,
    attachments: [],
}

export const facebookMessageWithCustomerReaction = ({
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
    channel: TicketChannel.Facebook,
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceType.FacebookComment,
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
} as unknown) as TicketMessage

export const facebookMessageWithPageReaction = ({
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
    channel: TicketChannel.Facebook,
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '2020-06-17T08:31:10+00:00',
    isMessage: true,
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceType.FacebookComment,
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
} as unknown) as TicketMessage

export const facebookMessageWithPageAndCustomerReactions = ({
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
    channel: TicketChannel.Facebook,
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
        type: TicketMessageSourceType.FacebookComment,
    },
} as unknown) as TicketMessage

export const hiddenFacebookMessage = ({
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
    channel: TicketChannel.Facebook,
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
        type: TicketMessageSourceType.FacebookComment,
    },
} as unknown) as TicketMessage

export const duplicatedHiddenFacebookMessage = ({
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
    channel: TicketChannel.Facebook,
    via: 'facebook',
    uri: 'http://example.com/messages/1',
    public: true,
    from_agent: false,
    created_datetime: '',
    isMessage: true,
    meta: {
        hidden_datetime: '2020-06-18T14:10:14.291746',
        private_reply: {
            original_ticket_id: 1234,
        },
        is_duplicated: true,
    },
    source: {
        to: [{name: 'Cust Omer', address: '657788504429455-4135481299826174'}],
        from: {name: 'Page', address: '657788504429455-657788504429455'},
        type: TicketMessageSourceType.FacebookComment,
    },
} as unknown) as TicketMessage

export const action: Action = {
    status: ActionStatus.Success,
    name: 'foo',
    title: '',
    type: 'user',
}
