import {fromJS, Map} from 'immutable'

export const integrationsState = {
    authentication: {
        facebook: {
            redirect_uri:
                'https://www.facebook.com/v2.12/dialog/oauth?scope=manage_pages%2Cpublish_pages%2Cread_page_mailboxes&client_id=1754623041419388&response_type=token&redirect_uri=https%3A%2F%2Facme-louis.ngrok.io%2Fintegrations%2Ffacebook%2Fauth%2Fcallback%2F29949774171f2ae73d6ad2c25119f8c9d879fa5dacee1bc4abe3806d7b2f144f%23',
        },
        shopify: {
            redirect_uri:
                'https://{{shop_name}}.myshopify.com/admin/oauth/authorize?scope=read_orders%2Cread_customers%2Cwrite_orders%2Cwrite_customers&state=29949774171f2ae73d6ad2c25119f8c9d879fa5dacee1bc4abe3806d7b2f144f&client_id=d783d0d0ded4ab7a13c20f47533819a3&redirect_uri=https%3A%2F%2Facme-louis.ngrok.io%2Fintegrations%2Fshopify%2Fauth%2Fcallback%2F',
        },
    },
    integrations: [
        {
            deleted_datetime: null,
            mappings: [],
            meta: {},
            facebook: null,
            http: {
                method: 'POST',
                form: {
                    attachments: [
                        {
                            title_link:
                                'https://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}',
                            title: '{{ticket.subject}}',
                            text: '{{ticket.first_message.body_text}}',
                        },
                    ],
                    text:
                        'New ticket <https://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}|*{{ticket.subject}}*> from *{{ticket.customer.name}}*',
                },
                headers: {},
                execution_order: 99,
                url:
                    'https://hooks.slack.com/services/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',
                request_content_type: 'application/json',
                id: 3,
                triggers: {
                    'ticket-created': false,
                },
                response_content_type: 'application/json',
            },
            deactivated_datetime: null,
            name: 'Slack Webhook',
            user: {
                id: 2,
            },
            uri: '/api/integrations/4/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:45.135436+00:00',
            type: 'http',
            id: 4,
            description: 'Notify on Slack when a new ticket is created.',
            updated_datetime: '2017-02-07T06:07:45.135448+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'billing@acme.gorgias.io',
                preferred: false,
                oauth: {
                    status: 'success',
                },
                signature: {
                    text: 'cheers, {{current_user.first_name}}',
                    html:
                        'cheers, <strong>{{current_user.first_name}}</strong>',
                },
                verified: true,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Billing',
            user: {
                id: 1,
            },
            uri: '/api/integrations/5/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:21:05.654940+00:00',
            type: 'gmail',
            id: 5,
            description: null,
            updated_datetime: '2017-02-07T06:21:05.655015+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [
                {
                    source_key: 'args.bayaname',
                    destination_key: 'customer.data.surname',
                    order: 0,
                    id: 2,
                },
            ],
            meta: {},
            facebook: null,
            http: {
                method: 'GET',
                form: null,
                headers: {},
                execution_order: 1,
                url:
                    'http://httpbin.org/get?bayaname={{ticket.customer.customer.name}}',
                request_content_type: 'application/json',
                id: 2,
                triggers: {
                    'ticket-created': true,
                    'ticket-updated': true,
                },
                response_content_type: 'application/json',
            },
            deactivated_datetime: null,
            name: 'Backoffice Integration 2',
            user: {
                id: 2,
            },
            uri: '/api/integrations/3/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:45.097894+00:00',
            type: 'http',
            id: 3,
            description: 'Test multi-step',
            updated_datetime: '2017-02-07T06:07:45.097905+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [
                {
                    source_key: 'args.name',
                    destination_key: 'customer.data.name',
                    order: 0,
                    id: 1,
                },
            ],
            meta: {
                foo: 'bar',
            },
            facebook: null,
            http: {
                method: 'GET',
                form: null,
                headers: {},
                execution_order: 0,
                url: 'http://httpbin.org/get?name={{ticket.customer.name}}',
                request_content_type: 'application/json',
                id: 1,
                triggers: {
                    'ticket-created': true,
                    'ticket-updated': true,
                },
                response_content_type: 'application/json',
            },
            deactivated_datetime: null,
            name: 'Backoffice Integration',
            user: {
                id: 2,
            },
            uri: '/api/integrations/2/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.764822+00:00',
            type: 'http',
            id: 2,
            description: 'Get customer data from our backoffice',
            updated_datetime: '2017-02-07T06:07:43.764835+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'support@acme.gorgias.io',
                preferred: true,
                signature: {
                    text: 'cheers, {{current_user.first_name}}',
                    html:
                        'cheers, <strong>{{current_user.first_name}}</strong>',
                },
                verified: true,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Support',
            user: {
                id: 2,
            },
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'email',
            id: 1,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'contact@acme.com',
                preferred: true,
                verified: true,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Contact',
            user: {
                id: 2,
            },
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'email',
            id: 5,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            smooch: null,
        },
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'unverified@gorgias.io',
                preferred: true,
                verified: false,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Unverified',
            user: {
                id: 2,
            },
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: 'email',
            id: 5,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            smooch: null,
        },
    ],
    state: {
        loading: {
            integrations: false,
            integration: false,
        },
    },
    integration: {
        deleted_datetime: null,
        mappings: [],
        meta: {
            address: 'billing@acme.com',
            preferred: false,
            oauth: {
                status: 'success',
            },
        },
        facebook: null,
        http: null,
        deactivated_datetime: null,
        name: 'Acme Billing',
        user: {
            id: 1,
        },
        uri: '/api/integrations/5/',
        decoration: null,
        locked_datetime: null,
        created_datetime: '2017-02-07T06:21:05.654940+00:00',
        type: 'gmail',
        id: 5,
        description: null,
        updated_datetime: '2017-02-07T06:21:05.655015+00:00',
        smooch: null,
    },
}

export const integrationsStateWithShopify = fromJS({
    authentication: {
        shopify: {
            redirect_uri:
                'https://{shop_name}.myshopify.com/admin/oauth/authorize?client_id=foo&scope=read_all_orders%2Cread_orders%2Cwrite_orders%2Cread_customers%2Cwrite_customers%2Cread_themes%2Cwrite_themes%2Cread_products%2Cread_draft_orders%2Cwrite_draft_orders&redirect_uri=https%3A%2F%2Faccount-manager-foo.ngrok.io%2Fintegrations%2Fshopify%2Fauth%2Fcallback%2F&state=bar',
        },
    },
    integrations: [
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                sync_customer_notes: true,
                shop_id: 54899465,
                uses_multi_currency: true,
                shop_domain: 'gorgiastest.com',
                currency: 'USD',
                shop_display_name: 'Store Gorgias 3',
                shop_plan: 'affiliate',
                shop_name: 'gorgiastest',
                oauth: {
                    scope: [
                        'read_all_orders',
                        'read_orders',
                        'write_orders',
                        'read_customers',
                        'write_customers',
                        'read_themes',
                        'write_themes',
                        'read_products',
                        'read_draft_orders',
                        'write_draft_orders',
                    ],
                    status: 'success',
                },
                import_state: {
                    customers: {
                        is_over: true,
                        oldest_created_at: '2017-03-17T18:26:16-07:00',
                    },
                    products: {
                        is_over: true,
                        oldest_created_at: '2020-01-07T16:36:31-08:00',
                    },
                },
                is_used_for_billing: true,
                need_scope_update: false,
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'My Shop',
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2020-01-28T22:19:15.604153+00:00',
            type: 'shopify',
            id: 1,
            description: null,
            updated_datetime: '2020-01-28T22:19:15.604157+00:00',
        },
    ],
}) as Map<any, any>
