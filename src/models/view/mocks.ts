import {OrderDirection} from 'models/api/types'
import {
    View,
    ViewCategory,
    ViewField,
    ViewType,
    ViewVisibility,
} from 'models/view/types'

export const newViews: View[] = [
    {
        category: ViewCategory.SystemTop,
        created_datetime: '2021-05-14T12:27:39.692574+00:00',
        deactivated_datetime: null,
        decoration: null,
        fields: [
            ViewField.Details,
            ViewField.Channel,
            ViewField.Assignee,
            ViewField.Status,
            ViewField.Customer,
            ViewField.Created,
            ViewField.LastMessage,
        ],
        filters: 'isNotEmpty(ticket.snooze_datetime)',
        filters_ast: {
            body: [
                {
                    expression: {
                        arguments: [
                            {
                                computed: false,
                                loc: {
                                    end: {column: 33, line: 1},
                                    start: {column: 11, line: 1},
                                },
                                object: {
                                    loc: {
                                        end: {column: 17, line: 1},
                                        start: {column: 11, line: 1},
                                    },
                                    name: 'ticket',
                                    type: 'Identifier',
                                },
                                property: {
                                    loc: {
                                        end: {column: 33, line: 1},
                                        start: {column: 18, line: 1},
                                    },
                                    name: 'snooze_datetime',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                        ],
                        callee: {
                            loc: {
                                end: {column: 10, line: 1},
                                start: {column: 0, line: 1},
                            },
                            name: 'isNotEmpty',
                            type: 'Identifier',
                        },
                        loc: {
                            end: {column: 34, line: 1},
                            start: {column: 0, line: 1},
                        },
                        type: 'CallExpression',
                    },
                    loc: {
                        end: {column: 34, line: 1},
                        start: {column: 0, line: 1},
                    },
                    type: 'ExpressionStatement',
                },
            ],
            loc: {end: {column: 34, line: 1}, start: {column: 0, line: 1}},
            sourceType: 'script',
            type: 'Program',
        },
        id: 4000,
        name: 'Snoozed',
        order_by: ViewField.LastMessage,
        order_dir: OrderDirection.Desc,
        search: null,
        section_id: null,
        slug: 'snoozed',
        type: ViewType.TicketList,
        uri: '/api/views/4000/',
        visibility: ViewVisibility.Public,
    },
    {
        category: ViewCategory.SystemBottom,
        created_datetime: '2023-07-31T15:30:10.210164+00:00',
        deactivated_datetime: null,
        decoration: null,
        fields: [
            ViewField.Details,
            ViewField.Tags,
            ViewField.Customer,
            ViewField.Created,
        ],
        filters: 'isNotEmpty(ticket.trashed_datetime)',
        filters_ast: {
            body: [
                {
                    expression: {
                        arguments: [
                            {
                                computed: false,
                                loc: {
                                    end: {column: 34, line: 1},
                                    start: {column: 11, line: 1},
                                },
                                object: {
                                    loc: {
                                        end: {column: 17, line: 1},
                                        start: {column: 11, line: 1},
                                    },
                                    name: 'ticket',
                                    type: 'Identifier',
                                },
                                property: {
                                    loc: {
                                        end: {column: 34, line: 1},
                                        start: {column: 18, line: 1},
                                    },
                                    name: 'trashed_datetime',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                        ],
                        callee: {
                            loc: {
                                end: {column: 10, line: 1},
                                start: {column: 0, line: 1},
                            },
                            name: 'isNotEmpty',
                            type: 'Identifier',
                        },
                        loc: {
                            end: {column: 35, line: 1},
                            start: {column: 0, line: 1},
                        },
                        type: 'CallExpression',
                    },
                    loc: {
                        end: {column: 35, line: 1},
                        start: {column: 0, line: 1},
                    },
                    type: 'ExpressionStatement',
                },
            ],
            loc: {end: {column: 35, line: 1}, start: {column: 0, line: 1}},
            sourceType: 'script',
            type: 'Program',
        },
        id: 8000,
        name: 'Trash',
        order_by: ViewField.Updated,
        order_dir: OrderDirection.Desc,
        search: null,
        section_id: null,
        slug: 'trash',
        type: ViewType.TicketList,
        uri: '/api/views/8000/',
        visibility: ViewVisibility.Public,
    },
    {
        category: ViewCategory.SystemTop,
        created_datetime: '2023-01-19T08:33:36.597140+00:00',
        deactivated_datetime: null,
        decoration: null,
        fields: [
            ViewField.Details,
            ViewField.Channel,
            ViewField.Assignee,
            ViewField.Status,
            ViewField.Customer,
            ViewField.Created,
            ViewField.LastMessage,
        ],
        filters: "eq(ticket.assignee_user.id, '{{current_user.id}}')",
        filters_ast: {
            body: [
                {
                    expression: {
                        arguments: [
                            {
                                computed: false,
                                loc: {
                                    end: {column: 26, line: 1},
                                    start: {column: 3, line: 1},
                                },
                                object: {
                                    computed: false,
                                    loc: {
                                        end: {column: 23, line: 1},
                                        start: {column: 3, line: 1},
                                    },
                                    object: {
                                        loc: {
                                            end: {column: 9, line: 1},
                                            start: {column: 3, line: 1},
                                        },
                                        name: 'ticket',
                                        type: 'Identifier',
                                    },
                                    property: {
                                        loc: {
                                            end: {column: 23, line: 1},
                                            start: {column: 10, line: 1},
                                        },
                                        name: 'assignee_user',
                                        type: 'Identifier',
                                    },
                                    type: 'MemberExpression',
                                },
                                property: {
                                    loc: {
                                        end: {column: 26, line: 1},
                                        start: {column: 24, line: 1},
                                    },
                                    name: 'id',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                            {
                                loc: {
                                    end: {column: 49, line: 1},
                                    start: {column: 28, line: 1},
                                },
                                raw: "'{{current_user.id}}'",
                                type: 'Literal',
                                value: '{{current_user.id}}',
                            },
                        ],
                        callee: {
                            loc: {
                                end: {column: 2, line: 1},
                                start: {column: 0, line: 1},
                            },
                            name: 'eq',
                            type: 'Identifier',
                        },
                        loc: {
                            end: {column: 50, line: 1},
                            start: {column: 0, line: 1},
                        },
                        type: 'CallExpression',
                    },
                    loc: {
                        end: {column: 50, line: 1},
                        start: {column: 0, line: 1},
                    },
                    type: 'ExpressionStatement',
                },
            ],
            loc: {end: {column: 50, line: 1}, start: {column: 0, line: 1}},
            sourceType: 'script',
            type: 'Program',
        },
        id: 3000,
        name: 'Inbox',
        order_by: ViewField.LastMessage,
        order_dir: OrderDirection.Desc,
        search: null,
        section_id: null,
        slug: 'inbox',
        uri: '/api/views/3000/',
        type: ViewType.TicketList,
        visibility: ViewVisibility.Public,
    },
    {
        category: ViewCategory.SystemBottom,
        created_datetime: '2019-09-20T14:51:40.332147+00:00',
        deactivated_datetime: null,
        decoration: null,
        fields: [
            ViewField.Details,
            ViewField.Tags,
            ViewField.Customer,
            ViewField.Created,
        ],
        filters: 'eq(ticket.spam, true)',
        filters_ast: {
            body: [
                {
                    expression: {
                        arguments: [
                            {
                                computed: false,
                                loc: {
                                    end: {column: 14, line: 1},
                                    start: {column: 3, line: 1},
                                },
                                object: {
                                    loc: {
                                        end: {column: 9, line: 1},
                                        start: {column: 3, line: 1},
                                    },
                                    name: 'ticket',
                                    type: 'Identifier',
                                },
                                property: {
                                    loc: {
                                        end: {column: 14, line: 1},
                                        start: {column: 10, line: 1},
                                    },
                                    name: 'spam',
                                    type: 'Identifier',
                                },
                                type: 'MemberExpression',
                            },
                            {
                                loc: {
                                    end: {column: 20, line: 1},
                                    start: {column: 16, line: 1},
                                },
                                raw: 'true',
                                type: 'Literal',
                                value: true,
                            },
                        ],
                        callee: {
                            loc: {
                                end: {column: 2, line: 1},
                                start: {column: 0, line: 1},
                            },
                            name: 'eq',
                            type: 'Identifier',
                        },
                        loc: {
                            end: {column: 21, line: 1},
                            start: {column: 0, line: 1},
                        },
                        type: 'CallExpression',
                    },
                    loc: {
                        end: {column: 21, line: 1},
                        start: {column: 0, line: 1},
                    },
                    type: 'ExpressionStatement',
                },
            ],
            loc: {end: {column: 21, line: 1}, start: {column: 0, line: 1}},
            sourceType: 'script',
            type: 'Program',
        },
        id: 7000,
        name: 'Spam',
        order_by: ViewField.Updated,
        order_dir: OrderDirection.Desc,
        search: null,
        section_id: null,
        slug: 'spam',
        type: ViewType.TicketList,
        uri: '/api/views/7000/',
        visibility: ViewVisibility.Public,
    },
]
