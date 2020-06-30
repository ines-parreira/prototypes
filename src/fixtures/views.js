export const view = {
    search: null,
    order_by: 'updated_datetime',
    deactivated_datetime: null,
    name: 'New & Open Tickets',
    slug: 'new-&-open-tickets',
    uri: '/api/views/7/',
    user_id: 2,
    decoration: null,
    display_order: 1,
    created_datetime: '2017-07-31T21:43:10.610368+00:00',
    group_by: null,
    fields: ['details', 'tags', 'customer', 'created'],
    type: 'ticket-list',
    id: 7,
    filters: 'neq(ticket.status, "closed")',
    order_dir: 'desc',
    filters_ast: {
        sourceType: 'script',
        loc: {
            start: {
                column: 0,
                line: 1,
            },
            end: {
                column: 28,
                line: 1,
            },
        },
        type: 'Program',
        body: [
            {
                loc: {
                    start: {
                        column: 0,
                        line: 1,
                    },
                    end: {
                        column: 28,
                        line: 1,
                    },
                },
                type: 'ExpressionStatement',
                expression: {
                    arguments: [
                        {
                            object: {
                                type: 'Identifier',
                                loc: {
                                    start: {
                                        column: 4,
                                        line: 1,
                                    },
                                    end: {
                                        column: 10,
                                        line: 1,
                                    },
                                },
                                name: 'ticket',
                            },
                            property: {
                                type: 'Identifier',
                                loc: {
                                    start: {
                                        column: 11,
                                        line: 1,
                                    },
                                    end: {
                                        column: 17,
                                        line: 1,
                                    },
                                },
                                name: 'status',
                            },
                            loc: {
                                start: {
                                    column: 4,
                                    line: 1,
                                },
                                end: {
                                    column: 17,
                                    line: 1,
                                },
                            },
                            type: 'MemberExpression',
                            computed: false,
                        },
                        {
                            value: 'closed',
                            loc: {
                                start: {
                                    column: 19,
                                    line: 1,
                                },
                                end: {
                                    column: 27,
                                    line: 1,
                                },
                            },
                            type: 'Literal',
                            raw: '"closed"',
                        },
                    ],
                    callee: {
                        type: 'Identifier',
                        loc: {
                            start: {
                                column: 0,
                                line: 1,
                            },
                            end: {
                                column: 3,
                                line: 1,
                            },
                        },
                        name: 'neq',
                    },
                    loc: {
                        start: {
                            column: 0,
                            line: 1,
                        },
                        end: {
                            column: 28,
                            line: 1,
                        },
                    },
                    type: 'CallExpression',
                },
            },
        ],
    },
}
