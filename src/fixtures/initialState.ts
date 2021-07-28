export const initialState = {
    agents: {
        all: [
            {
                active: true,
                bio: null,
                country: null,
                created_datetime: '2020-10-20T14:57:22.993592+00:00',
                deactivated_datetime: null,
                email: 'hello@acme.gorgias.io',
                external_id: '1',
                firstname: 'Acme',
                id: 1,
                language: null,
                lastname: 'Support',
                meta: {},
                name: 'Acme Support',
                roles: [
                    {
                        id: 7,
                        name: 'admin',
                    },
                ],
                timezone: 'US/Pacific',
                updated_datetime: '2020-10-20T14:57:22.995691+00:00',
            },
        ],
    },
    billing: {
        plans: {
            'advanced-monthly-usd-2': {
                amount: 75000,
                cost_per_ticket: 0.14,
                currency: 'usd',
                free_tickets: 6000,
                integrations: 100,
                interval: 'month',
                limits: {
                    messages: {
                        default: 1000,
                        max: 1000,
                        min: 800,
                    },
                    tickets: {
                        default: 350,
                        max: 350,
                        min: 300,
                    },
                },
                name: 'Advanced',
                order: 3,
                public: true,
                trial_period_days: 7,
            },
        },
    },
    chats: {
        tickets: [
            {
                channel: 'chat',
                customer: {
                    email: 'marïe@gorgias.io',
                    id: 4,
                    name: 'Marie Curie',
                },
                id: 32,
                is_unread: true,
                last_message_datetime: '2020-10-20T06:06:28.223864',
            },
        ],
    },
    currentAccount: {
        created_datetime: '2020-10-20T14:57:22.614970+00:00',
        current_subscription: {
            plan: 'pro-yearly-usd-2',
            start_datetime: '2020-10-20T14:57:24+00:00',
            status: 'trialing',
            trial_end_datetime: '2020-10-27T14:57:24+00:00',
            trial_start_datetime: '2020-10-20T14:57:24+00:00',
        },
        deactivated_datetime: null,
        domain: 'acme',
        meta: {
            company_domain: 'acme.com',
            company_name: 'Acme Corp',
        },
        settings: [],
        status: {
            notification: {
                message:
                    'Your free trial is ending soon. Please add a payment method to continue using Gorgias.',
                type: 'warning',
            },
            status: 'active',
        },
        user_id: 1,
    },
    currentUser: {
        active: true,
        bio: null,
        channels: [],
        country: 'US',
        created_datetime: '2020-10-20T14:57:25.259768+00:00',
        deactivated_datetime: null,
        email: 'alex@gorgias.io',
        external_id: '2',
        firstname: 'Alex',
        id: 2,
        is_active: true,
        language: 'en',
        lastname: 'Plugaru',
        meta: {},
        name: 'Alex Plugaru',
        note: null,
        roles: [
            {
                id: 7,
                name: 'admin',
            },
        ],
        settings: [
            {
                data: {
                    available: true,
                    show_macros: false,
                },
                id: 2,
                type: 'preferences',
            },
        ],
        timezone: 'EST',
        updated_datetime: '2020-10-20T14:57:25.261196+00:00',
    },
    integrations: {
        authentication: {},
        extra: {
            facebook: {
                max_account_ads: 100,
            },
            gorgias_chat: {
                bundleUrl: 'https://chat-bundle.test.gorgias.chat',
                chatUrl: 'chat-api.test.gorgias.chat',
                wsUrl: 'chat-ws.test.gorgias.chat',
            },
        },
        integrations: [],
    },
    schemas: {
        definitions: {},
        info: {
            description: 'The new generation helpdesk',
            title: 'Gorgias',
            version: '0.0.1',
        },
        paths: {},
        swagger: '2.0',
    },
    tags: {
        items: [
            {
                created_datetime: '2020-10-20T14:57:28.155180+00:00',
                decoration: null,
                deleted_datetime: null,
                description: null,
                id: 4,
                name: 'refund accepted',
                uri: '/api/tags/4/',
            },
        ],
    },
    teams: {
        all: {},
    },
    viewSections: {
        '1': {
            created_datetime: '2020-10-20T15:10:01.996156+00:00',
            decoration: {
                emoji: '😀',
            },
            id: 1,
            name: 'test',
            private: false,
            updated_datetime: '2020-10-20T15:10:01.996168+00:00',
            uri: '/api/view-sections/1/',
        },
    },
    views: {
        active: {},
        counts: {},
        items: [
            {
                category: 'system',
                created_datetime: '2020-10-20T14:57:27.612323+00:00',
                deactivated_datetime: null,
                decoration: null,
                display_order: 1,
                fields: ['name', 'email', 'created', 'updated'],
                filters: 'eq(user.roles.name, "user")',
                filters_ast: {},
                group_by: null,
                id: 9,
                name: 'All customers',
                order_by: 'updated_datetime',
                order_dir: 'desc',
                search: null,
                slug: 'all-customers',
                type: 'customer-list',
                uri: '/api/views/9/',
                visibility: 'public',
            },
        ],
        recent: {
            '9': {
                inserted_datetime: '2020-10-28T09:23:35.294Z',
                updated_datetime: '2020-10-28T09:23:35.294Z',
            },
        },
    },
}
