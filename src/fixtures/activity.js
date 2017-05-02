export default {
    git_commit: '123fez324',
    current_account: {
        deactivated_datetime: null,
        meta: null
    },
    events: [
        {
            created_datetime: '2016-11-23T05:11:17.765655+00:00',
            user_id: null,
            object_id: 24,
            object_type: 'Ticket',
            object: {
                channel: 'facebook',
                status: 'new',
                created_datetime: '2016-11-26T08:38:17.765655+00:00',
                subject: 'Update credit card info 3',
                via: 'email',
                messages: [
                    {
                        channel: 'facebook',
                        stripped_text: null,
                        via: 'email',
                        source: {
                            message_id: 'm_mid.1464181280500:dbfa0dc1b13e743770',
                            to: [
                                {
                                    name: 'Acme Support',
                                    address: '1053263268098545'
                                }
                            ],
                            conversation_id: 't_mid.1464181269480:2ba9b77d8b5721a622',
                            page_id: '1053263268098545',
                            type: 'facebook-message',
                            from: {
                                name: 'blah blah',
                                address: '10209352850648048'
                            }
                        },
                        meta: null,
                        receiver: {
                            name: 'John Doe',
                            email: 'john.doe@gorgias.io',
                            firstname: 'John',
                            id: 2,
                            lastname: 'Doe'
                        },
                        actions: null,
                        from_agent: false,
                        body_text: 'Hi, I was support to receive a refund 2 days ago but I\'ve realized that the credit card thatis registered on my account has expired. How can I please update it? Thanks!',
                        body_html: '',
                        id: 34,
                        stripped_html: null,
                        created_datetime: '2016-11-23T05:11:17.765655+00:00',
                        failed_datetime: null,
                        subject: 'Update credit card info',
                        sender: {
                            name: 'Marie Curie',
                            email: 'marie@gorgias.io',
                            firstname: 'Marie',
                            id: 4,
                            lastname: 'Curie'
                        },
                        ticket_id: 24,
                        sent_datetime: null,
                        stripped_signature: null,
                        attachments: null,
                        external_id: null,
                        headers: null,
                        uri: '/api/tickets/1/messages/0/',
                        public: true
                    }
                ],
                updated_datetime: '2016-11-27T03:47:17.765655+00:00',
                id: 24,
                requester: {
                    email: 'marie@gorgias.io',
                    customer: {
                        email: 'romain@gorgias.io',
                        firstOrderDate: '2016-04-08T11:35:02',
                        orders: [
                            {
                                status: 'Delivered',
                                deliveryDate: '2016-28-08T12:45:05',
                                feedback: 5,
                                total: 14,
                                discountedAmount: 5,
                                orderItems: [
                                    {
                                        name: 'Cheesy garlic pizza',
                                        quantity: 1,
                                        sku: 1262,
                                        cost: 14
                                    }
                                ],
                                id: 49248
                            },
                            {
                                status: 'Delivered',
                                deliveryDate: '2016-04-22T8:29:01',
                                feedback: 4,
                                total: 11.2,
                                discountedAmount: 0,
                                orderItems: [],
                                id: 21532
                            }
                        ],
                        created: '2016-04-08T11:35:02',
                        ltv: 200,
                        name: 'Marie Curie',
                        surname: 'Marie Curie',
                        points: 400,
                        city: 'San Francisco',
                        orderCount: 4
                    },
                    lastname: 'Curie',
                    channels: [
                        {
                            preferred: true,
                            created_datetime: '2016-11-28T11:47:01.751844+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: 'marie@gorgias.io',
                            updated_datetime: '2016-11-28T11:47:01.751850+00:00',
                            id: 10,
                            type: 'email'
                        },
                        {
                            preferred: false,
                            created_datetime: '2016-11-28T11:47:01.754836+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: '@realMarieCurie',
                            updated_datetime: '2016-11-28T11:47:01.754841+00:00',
                            id: 11,
                            type: 'twitter'
                        },
                        {
                            preferred: false,
                            created_datetime: '2016-11-28T11:47:01.757736+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: '7894561230',
                            updated_datetime: '2016-11-28T11:47:01.757741+00:00',
                            id: 12,
                            type: 'facebook'
                        }
                    ],
                    name: 'Marie Curie',
                    id: 4,
                    firstname: 'Marie'
                }
            },
            uri: '/api/events/-1/',
            type: 'ticket-created',
            id: -1
        },
        {
            created_datetime: '2016-11-23T05:11:17.765655+00:00',
            user_id: null,
            object_id: 25,
            object_type: 'Ticket',
            object: {
                channel: 'facebook',
                status: 'new',
                created_datetime: '2016-11-26T04:43:17.765655+00:00',
                subject: 'Update credit card info 4',
                via: 'email',
                messages: [
                    {
                        channel: 'facebook',
                        stripped_text: null,
                        via: 'email',
                        source: {
                            message_id: 'm_mid.1464181280500:dbfa0dc1b13e743770',
                            to: [
                                {
                                    name: 'Acme Support',
                                    address: '1053263268098545',
                                }
                            ],
                            conversation_id: 't_mid.1464181269480:2ba9b77d8b5721a622',
                            page_id: '1053263268098545',
                            type: 'facebook-message',
                            from: {
                                name: 'blah blah',
                                address: '10209352850648048',
                            }
                        },
                        meta: null,
                        receiver: {
                            name: 'John Doe',
                            email: 'john.doe@gorgias.io',
                            firstname: 'John',
                            id: 2,
                            lastname: 'Doe'
                        },
                        actions: null,
                        from_agent: false,
                        body_text: 'Hi, I was support to receive a refund 2 days ago but I\'ve realized that the credit card thatis registered on my account has expired. How can I please update it? Thanks!',
                        body_html: '',
                        id: 35,
                        stripped_html: null,
                        created_datetime: '2016-11-23T05:11:17.765655+00:00',
                        failed_datetime: null,
                        subject: 'Update credit card info',
                        sender: {
                            name: 'Marie Curie',
                            email: 'marie@gorgias.io',
                            firstname: 'Marie',
                            id: 4,
                            lastname: 'Curie'
                        },
                        ticket_id: 25,
                        sent_datetime: null,
                        stripped_signature: null,
                        attachments: null,
                        external_id: null,
                        headers: null,
                        uri: '/api/tickets/1/messages/0/',
                        public: true
                    }
                ],
                updated_datetime: '2016-11-27T01:51:17.765655+00:00',
                id: 25,
                requester: {
                    email: 'marie@gorgias.io',
                    customer: {
                        email: 'romain@gorgias.io',
                        firstOrderDate: '2016-04-08T11:35:02',
                        orders: [
                            {
                                status: 'Delivered',
                                deliveryDate: '2016-28-08T12:45:05',
                                feedback: 5,
                                total: 14,
                                discountedAmount: 5,
                                orderItems: [
                                    {
                                        name: 'Cheesy garlic pizza',
                                        quantity: 1,
                                        sku: 1262,
                                        cost: 14
                                    }
                                ],
                                id: 49248
                            },
                            {
                                status: 'Delivered',
                                deliveryDate: '2016-04-22T8:29:01',
                                feedback: 4,
                                total: 11.2,
                                discountedAmount: 0,
                                orderItems: [],
                                id: 21532
                            }
                        ],
                        created: '2016-04-08T11:35:02',
                        ltv: 200,
                        name: 'Marie Curie',
                        surname: 'Marie Curie',
                        points: 400,
                        city: 'San Francisco',
                        orderCount: 4
                    },
                    lastname: 'Curie',
                    channels: [
                        {
                            preferred: true,
                            created_datetime: '2016-11-28T11:47:01.751844+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: 'marie@gorgias.io',
                            updated_datetime: '2016-11-28T11:47:01.751850+00:00',
                            id: 10,
                            type: 'email'
                        },
                        {
                            preferred: false,
                            created_datetime: '2016-11-28T11:47:01.754836+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: '@realMarieCurie',
                            updated_datetime: '2016-11-28T11:47:01.754841+00:00',
                            id: 11,
                            type: 'twitter'
                        },
                        {
                            preferred: false,
                            created_datetime: '2016-11-28T11:47:01.757736+00:00',
                            user: {
                                name: 'Marie Curie',
                                id: 4
                            },
                            address: '7894561230',
                            updated_datetime: '2016-11-28T11:47:01.757741+00:00',
                            id: 12,
                            type: 'facebook'
                        }
                    ],
                    name: 'Marie Curie',
                    id: 4,
                    firstname: 'Marie'
                }
            },
            uri: '/api/events/-1/',
            type: 'ticket-created',
            id: -1
        }
    ],
    current_usage: {
        data: {
            cost: 0,
            tickets: 30
        },
        meta: {
            start_datetime: '2016-10-31T18:32:05.684850+00:00',
            end_datetime: '2016-11-30T18:32:05.684850+00:00'
        }
    },
    views: [
        {
            id: 13,
            uri: '/api/views/13/',
            type: 'user-list',
            slug: 'all-users',
            name: 'All users',
            decoration: null,
            filters: '',
            filters_ast: {
                loc: {
                    end: {
                        column: 0,
                        line: 0
                    },
                    start: {
                        column: 0,
                        line: 0
                    }
                },
                body: [],
                type: 'Program',
                sourceType: 'script'
            },
            search: null,
            user: {
                id: 2,
                email: 'john.doe@gorgias.io',
                name: 'John Doe'
            },
            display_order: 1,
            fields: ['name', 'email', 'roles', 'created'],
            group_by: null,
            order_by: 'updated_datetime',
            order_dir: 'desc',
            count: 4,
            created_datetime: '2016-11-27T12:35:17.087060+00:00',
            deactivated_datetime: null
        },
        {
            id: 12,
            uri: '/api/views/12/',
            type: 'ticket-list',
            slug: 'my-tickets',
            name: 'My Tickets',
            decoration: null,
            filters: 'eq(ticket.assignee_user.id, "{current_user.id}") && neq(ticket.status, "closed")',
            filters_ast: {
                loc: {
                    end: {
                        column: 80,
                        line: 1
                    },
                    start: {
                        column: 0,
                        line: 1
                    }
                },
                body: [
                    {
                        loc: {
                            end: {
                                column: 80,
                                line: 1
                            },
                            start: {
                                column: 0,
                                line: 1
                            }
                        },
                        type: 'ExpressionStatement',
                        expression: {
                            left: {
                                loc: {
                                    end: {
                                        column: 48,
                                        line: 1
                                    },
                                    start: {
                                        column: 0,
                                        line: 1
                                    }
                                },
                                arguments: [
                                    {
                                        property: {
                                            loc: {
                                                end: {
                                                    column: 26,
                                                    line: 1
                                                },
                                                start: {
                                                    column: 24,
                                                    line: 1
                                                }
                                            },
                                            type: 'Identifier',
                                            name: 'id'
                                        },
                                        loc: {
                                            end: {
                                                column: 26,
                                                line: 1
                                            },
                                            start: {
                                                column: 3,
                                                line: 1
                                            }
                                        },
                                        object: {
                                            property: {
                                                loc: {
                                                    end: {
                                                        column: 23,
                                                        line: 1
                                                    },
                                                    start: {
                                                        column: 10,
                                                        line: 1
                                                    }
                                                },
                                                type: 'Identifier',
                                                name: 'assignee_user'
                                            },
                                            loc: {
                                                end: {
                                                    column: 23,
                                                    line: 1
                                                },
                                                start: {
                                                    column: 3,
                                                    line: 1
                                                }
                                            },
                                            object: {
                                                loc: {
                                                    end: {
                                                        column: 9,
                                                        line: 1
                                                    },
                                                    start: {
                                                        column: 3,
                                                        line: 1
                                                    }
                                                },
                                                type: 'Identifier',
                                                name: 'ticket'
                                            },
                                            type: 'MemberExpression',
                                            computed: false
                                        },
                                        type: 'MemberExpression',
                                        computed: false
                                    },
                                    {
                                        loc: {
                                            end: {
                                                column: 47,
                                                line: 1
                                            },
                                            start: {
                                                column: 28,
                                                line: 1
                                            }
                                        },
                                        raw: '"{current_user.id}"',
                                        value: '{current_user.id}',
                                        type: 'Literal'
                                    }
                                ],
                                callee: {
                                    loc: {
                                        end: {
                                            column: 2,
                                            line: 1
                                        },
                                        start: {
                                            column: 0,
                                            line: 1
                                        }
                                    },
                                    type: 'Identifier',
                                    name: 'eq'
                                },
                                type: 'CallExpression'
                            },
                            loc: {
                                end: {
                                    column: 80,
                                    line: 1
                                },
                                start: {
                                    column: 0,
                                    line: 1
                                }
                            },
                            type: 'LogicalExpression',
                            operator: '&&',
                            right: {
                                loc: {
                                    end: {
                                        column: 80,
                                        line: 1
                                    },
                                    start: {
                                        column: 52,
                                        line: 1
                                    }
                                },
                                arguments: [
                                    {
                                        property: {
                                            loc: {
                                                end: {
                                                    column: 69,
                                                    line: 1
                                                },
                                                start: {
                                                    column: 63,
                                                    line: 1
                                                }
                                            },
                                            type: 'Identifier',
                                            name: 'status'
                                        },
                                        loc: {
                                            end: {
                                                column: 69,
                                                line: 1
                                            },
                                            start: {
                                                column: 56,
                                                line: 1
                                            }
                                        },
                                        object: {
                                            loc: {
                                                end: {
                                                    column: 62,
                                                    line: 1
                                                },
                                                start: {
                                                    column: 56,
                                                    line: 1
                                                }
                                            },
                                            type: 'Identifier',
                                            name: 'ticket'
                                        },
                                        type: 'MemberExpression',
                                        computed: false
                                    },
                                    {
                                        loc: {
                                            end: {
                                                column: 79,
                                                line: 1
                                            },
                                            start: {
                                                column: 71,
                                                line: 1
                                            }
                                        },
                                        raw: '"closed"',
                                        value: 'closed',
                                        type: 'Literal'
                                    }
                                ],
                                callee: {
                                    loc: {
                                        end: {
                                            column: 55,
                                            line: 1
                                        },
                                        start: {
                                            column: 52,
                                            line: 1
                                        }
                                    },
                                    type: 'Identifier',
                                    name: 'neq'
                                },
                                type: 'CallExpression'
                            }
                        }
                    }
                ],
                type: 'Program',
                sourceType: 'script'
            },
            search: null,
            user: {
                id: 2,
                email: 'john.doe@gorgias.io',
                name: 'John Doe'
            },
            display_order: 1,
            fields: ['priority', 'details', 'tags', 'requester', 'created'],
            group_by: null,
            order_by: 'updated_datetime',
            order_dir: 'desc',
            count: 31,
            created_datetime: '2016-11-27T12:35:17.086049+00:00',
            deactivated_datetime: null
        }
    ]
}
