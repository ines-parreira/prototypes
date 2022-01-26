import {HttpMethod} from '../models/api/types'
import {Macro} from '../models/macro/types'
import {
    MacroAction,
    MacroActionType,
    MacroActionName,
} from '../models/macroAction/types'

export const macros = [
    {
        id: 1,
        name: 'Waive Fee',
        actions: [
            {
                type: MacroActionType.User,
                title: 'Add Refund Tag',
                arguments: {tags: 'refund'},
                name: MacroActionName.AddTags,
            },
            {
                type: MacroActionType.User,
                title: 'Add Refund Accepted Tag',
                arguments: {tags: 'refund accepted'},
                name: MacroActionName.AddTags,
            },
            {
                type: MacroActionType.User,
                description:
                    'Hello {{ticket.customer.name}},\n\nThanks for placing an order with our company.\n\nDue to ||reason for the refund||, we will be happy to adjust your order to reflect the correct amount. Please allow 1-5 business days for any charges to reconcile with your account. We apologize for the inconvenience.\n\nIf you have any questions, concerns or comments, please don\u2019t hesitate to reach out.\n\nHave a great day and thanks for using our service!\n\nSincerely,\n{{current_user.name}}',
                title: 'Set Response Text',
                arguments: {
                    body_text:
                        'Hello {{ticket.customer.name}},\n\nThanks for placing an order with our company.\n\nDue to ||reason for the refund||, we will be happy to adjust your order to reflect the correct amount. Please allow 1-5 business days for any charges to reconcile with your account. We apologize for the inconvenience.\n\nIf you have any questions, concerns or comments, please don\u2019t hesitate to reach out.\n\nHave a great day and thanks for using our service!\n\nSincerely,\n{{current_user.name}}',
                    body_html:
                        '<div>Hello {{ticket.customer.name}},</div><br/><div>Thanks for placing an order with our company.</div><br/><div>Due to ||reason for the refund||, we will be happy to adjust your order to reflect the correct amount. Please allow 1-5 business days for any charges to reconcile with your account. We apologize for the inconvenience.</div><br/><div>If you have any questions, concerns or comments, please don\u2019t hesitate to reach out.</div><br/><div>Have a great day and thanks for using our service!</div><br/><div>Sincerely,</div><div>{{current_user.name}}</div>',
                },
                name: MacroActionName.SetResponseText,
            },
            {
                type: MacroActionType.User,
                description: "Refund the user's last month ",
                title: 'Refund Last Month',
                arguments: {
                    method: HttpMethod.Get,
                    headers: [
                        {
                            editable: false,
                            key: 'X_API_KEY',
                            value: '9298jjdhdjkh393jhajkhdjashuurh',
                        },
                        {
                            editable: false,
                            key: 'content-type',
                            value: 'application/json',
                        },
                    ],
                    url: 'https://httpbin.org/post',
                    params: [
                        {
                            editable: false,
                            key: 'user_id',
                            value: '{ticket.customer.id}',
                        },
                    ],
                },
                name: MacroActionName.Http,
            },
        ],
        created_datetime: '2017-08-01T17:56:51.190187+00:00',
        updated_datetime: '2017-08-01T17:56:51.190199+00:00',
        usage: 1,
    },
    {
        id: 2,
        name: 'Do Not Waive Fee',
        actions: [
            {
                type: MacroActionType.User,
                title: 'Add Rejected Tag',
                arguments: {tags: 'rejectedTag'},
                name: MacroActionName.AddTags,
            },
            {
                type: MacroActionType.User,
                description:
                    "Thanks for your patience and I'm so sorry to hear you are unable to make your reservation!\n\nSubject to our cancellation policy your membership with us will run out at the end of the month,\nand you will be billed one last time then.",
                title: 'Set Response Text',
                arguments: {
                    body_text:
                        "Thanks for your patience and I'm so sorry to hear you are unable to make your reservation!\n\nSubject to our cancellation policy your membership with us will run out at the end of the month,\nand you will be billed one last time then.",
                    body_html:
                        "<div>Thanks for your patience and I'm so sorry to hear you are unable to make your reservation!</div><br/><div>Subject to our cancellation policy your membership with us will run out at the end of the month,</div><div>and you will be billed one last time then.</div>",
                },
                name: MacroActionName.SetResponseText,
            },
        ],
        created_datetime: '2017-08-01T17:56:51.212461+00:00',
        updated_datetime: '2017-08-01T17:56:51.212472+00:00',
        usage: 3,
    },
    {
        id: 3,
        name: 'Cancel Order',
        actions: [
            {
                type: MacroActionType.User,
                description:
                    'Hello {{ticket.customer.name}},\n\nUnfortunately, it has come to our attention that you never received your order. As a result, we will immediately have this order canceled and issue a refund. We will be reaching out to ||merchant_name|| for an explanation as to why your order was not delivered. We sincerely apologize for the inconvenience.\n\nPlease allow 1-5 business days for any possible charges to reconcile with your account. If any credits were used during this transaction, they will return to your account and be available for use on your next order.\n\nIf you have any questions, concerns or comments, please don\u2019t hesitate to reach out.\n\nHave a great day and thanks for using our service.\n\nSincerely,\n{{current_user.name}}',
                title: 'Set Response Text',
                arguments: {
                    body_text:
                        'Hello {{ticket.customer.name}},\n\nUnfortunately, it has come to our attention that you never received your order. As a result, we will immediately have this order canceled and issue a refund. We will be reaching out to ||merchant_name|| for an explanation as to why your order was not delivered. We sincerely apologize for the inconvenience.\n\nPlease allow 1-5 business days for any possible charges to reconcile with your account. If any credits were used during this transaction, they will return to your account and be available for use on your next order.\n\nIf you have any questions, concerns or comments, please don\u2019t hesitate to reach out.\n\nHave a great day and thanks for using our service.\n\nSincerely,\n{{current_user.name}}',
                    body_html:
                        '<div>Hello {{ticket.customer.name}},</div><br/><div>Unfortunately, it has come to our attention that you never received your order. As a result, we will immediately have this order canceled and issue a refund. We will be reaching out to ||merchant_name|| for an explanation as to why your order was not delivered. We sincerely apologize for the inconvenience.</div><br/><div>Please allow 1-5 business days for any possible charges to reconcile with your account. If any credits were used during this transaction, they will return to your account and be available for use on your next order.</div><br/><div>If you have any questions, concerns or comments, please don\u2019t hesitate to reach out.</div><br/><div>Have a great day and thanks for using our service.</div><br/><div>Sincerely,</div><div>{{current_user.name}}</div>',
                },
                name: MacroActionName.SetResponseText,
            },
        ],
        created_datetime: '2017-08-01T17:56:51.220733+00:00',
        updated_datetime: '2017-08-01T17:56:51.220744+00:00',
        usage: 0,
    },
] as unknown as Macro[]

export const setTextAction: MacroAction = {
    arguments: {
        body_html:
            '<div>Hello {{ticket.customer.name}},</div><div><br></div><div>Thanks for placing an order with our company',
        body_text:
            'Hello {{ticket.customer.name}},\n\nThanks for placing an order with our company',
    },
    description: 'set text',
    name: MacroActionName.SetResponseText,
    title: 'Set Response Text',
    type: MacroActionType.User,
}

export const addTagsAction: MacroAction = {
    arguments: {
        tags: 'refund,billing,refund accepted',
    },
    name: MacroActionName.AddTags,
    title: 'Add Refund Tag',
    type: MacroActionType.User,
}

export const httpAction: MacroAction = {
    arguments: {
        url: 'https://httpbin.org/post',
        method: HttpMethod.Get,
        params: [
            {
                key: 'user_id',
                value: '{{ticket.customer.id}}',
                editable: false,
            },
        ],
        headers: [
            {
                key: 'X_API_KEY',
                value: '9298jjdhdjkh393jhajkhdjashuurh',
                editable: false,
            },
            {
                key: 'content-type',
                value: 'application/json',
                editable: false,
            },
        ],
    },
    description: "Refund the user's last month ",
    name: MacroActionName.Http,
    title: 'Refund Last Month',
    type: MacroActionType.User,
}

export const shopifyAction: MacroAction = {
    arguments: {},
    name: MacroActionName.ShopifyFullRefundLastOrder,
    title: 'Refund last order',
    type: MacroActionType.User,
}

export const snoozeTicketAction: MacroAction = {
    name: MacroActionName.SnoozeTicket,
    type: MacroActionType.User,
    title: 'Snooze for',
    arguments: {
        snooze_timedelta: '1d',
    },
}

export const setSubjectAction: MacroAction = {
    name: MacroActionName.SetSubject,
    type: MacroActionType.User,
    title: 'Set subject',
    arguments: {
        subject: 'Test Subject',
    },
}

export const setStatusAction: MacroAction = {
    name: MacroActionName.SetStatus,
    type: MacroActionType.User,
    title: 'Set status',
    arguments: {
        status: 'open',
    },
}

export const addAttachmentsAction: MacroAction = {
    name: MacroActionName.AddAttachments,
    type: MacroActionType.User,
    title: 'Add attachments',
    arguments: {
        attachments: [
            {
                url: 'http://httpbin.org',
                name: 'Image file name',
                size: 4019,
                content_type: 'image/png',
            },
        ],
    },
}

export const addInternalNoteAction: MacroAction = {
    name: MacroActionName.AddInternalNote,
    type: MacroActionType.User,
    title: 'Add internal note',
    arguments: {
        body_text: 'Hello',
        body_html: '<div>Hello</div>',
    },
}

export const macroFixture = {
    category: null,
    usage: 0,
    name: 'mock macro',
    uri: '/api/macros/1/',
    external_id: null,
    created_datetime: '2021-05-04T13:33:25.314850+00:00',
    id: 1,
    actions: [],
    updated_datetime: '2021-05-07T12:23:40.369422+00:00',
}
