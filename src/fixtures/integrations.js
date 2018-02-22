export const integrationsState = {
    authentication: {
        facebook: {
            redirect_uri: 'https://www.facebook.com/v2.12/dialog/oauth?scope=manage_pages%2Cpublish_pages%2Cread_page_mailboxes&client_id=1754623041419388&response_type=token&redirect_uri=https%3A%2F%2Facme-louis.ngrok.io%2Fintegrations%2Ffacebook%2Fauth%2Fcallback%2F29949774171f2ae73d6ad2c25119f8c9d879fa5dacee1bc4abe3806d7b2f144f%23'
        },
        shopify: {
            redirect_uri: 'https://{{shop_name}}.myshopify.com/admin/oauth/authorize?scope=read_orders%2Cread_customers%2Cwrite_orders%2Cwrite_customers&state=29949774171f2ae73d6ad2c25119f8c9d879fa5dacee1bc4abe3806d7b2f144f&client_id=d783d0d0ded4ab7a13c20f47533819a3&redirect_uri=https%3A%2F%2Facme-louis.ngrok.io%2Fintegrations%2Fshopify%2Fauth%2Fcallback%2F'
        }
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
                    attachments: [{
                        title_link: 'https://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}',
                        title: '{{ticket.subject}}',
                        text: '{{ticket.first_message.body_text}}'
                    }],
                    text: 'New ticket <https://{{ticket.account.domain}}.gorgias.io/app/ticket/{{ticket.id}}|*{{ticket.subject}}*> from *{{ticket.requester.name}}*'
                },
                headers: {},
                execution_order: 99,
                url: 'https://hooks.slack.com/services/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',
                request_content_type: 'application/json',
                id: 3,
                triggers: {
                    'ticket-created': false
                },
                response_content_type: 'application/json'
            },
            deactivated_datetime: null,
            name: 'Slack Webhook',
            user: {
                id: 2
            },
            uri: '/api/integrations/4/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:45.135436+00:00',
            connections: [],
            type: 'http',
            id: 4,
            description: 'Notify on Slack when a new ticket is created.',
            updated_datetime: '2017-02-07T06:07:45.135448+00:00',
            smooch: null
        },
        {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'billing@acme.gorgias.io',
                preferred: false,
                oauth: {
                    status: 'success'
                },
                signature: {
                    text: 'cheers, {{current_user.first_name}}',
                    html: 'cheers, <strong>{{current_user.first_name}}</strong>'
                }
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Billing',
            user: {
                id: 1
            },
            uri: '/api/integrations/5/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:21:05.654940+00:00',
            connections: [{
                deleted_datetime: null,
                data: '{"_class": "OAuth2Credentials", "token_info_uri": "https://www.googleapis.com/oauth2/v3/tokeninfo", "client_id": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "user_agent": null, "token_expiry": "2017-02-07T07:21:04Z", "refresh_token": null, "revoke_uri": "https://accounts.google.com/o/oauth2/revoke", "client_secret": "P6va3BWOYgp7kt_DCsVUTD3s", "_module": "oauth2client.client", "scopes": ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/gmail.settings.sharing", "https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.send"], "token_response": {"access_token": "ya29.GlzrAwXs98i32S3XgitR5dwFMm56FuR9_OX5PHxuWpHBadC40CqsAXCjrMXGePFjAzDKfaXDdMlsiljgs-zkxR-DidrQX8SGGK3ThywdvWFrajYsVEXYAABUKimBCw", "token_type": "Bearer", "expires_in": 3600, "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImI4M2M0ZTU5YTllMWZiODA5ZTM4ZjkwMmFhMWE4YzVkZjY1ZTk1MmEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0ODY0NDg0NjQsImV4cCI6MTQ4NjQ1MjA2NCwiYXRfaGFzaCI6IlV5NzJ6QjM0RjFVbUxCVzZXSGx1UmciLCJhdWQiOiI1MzM4MjQyMDc1MzItNW1oMzdtbmhsOGNjbm4ycWc0Z3AxNTBiamVibjlhMWkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDMwMTM3MzEyMTUyMTEyNjc3MzciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiNTMzODI0MjA3NTMyLTVtaDM3bW5obDhjY25uMnFnNGdwMTUwYmplYm45YTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJsb3Vpcy5iYXJyYW5xdWVpcm9AZ21haWwuY29tIiwibmFtZSI6IkxvdWlzIEJhcnJhbnF1ZWlybyIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLU1NMWhBMEhXaHM0L0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FEUGxoZklwN1BSdDFsNWwxN0RPZ1FOZnVnZzFmOEVYN3cvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkxvdWlzIiwiZmFtaWx5X25hbWUiOiJCYXJyYW5xdWVpcm8iLCJsb2NhbGUiOiJmciJ9.TN4rZIBQIIB33xUiadHp4uKHD-NKif9em9VYm3ZmvvfMPlN-cBzSjFQwRurJmt8uHgIv19oohJXTvfgid5KmtyRoWpMgy2AZmk_Dz1cmTcqsZT4pCqmHDssi73HfnyGftAHitE82kn3bna_mpF839LGQGrB-gk4Jb03qud--fz1igjNGfSjAL_lcowMQvNIjmX0dYonJb1Hg0UOuloyfajuUmqumGM9jIANhUu6-QEsMZyuM-grVX8DKNqRY0sn0udiybZwFugit-t6v9kZ6j4CGOT4CnhdwWc745x9--gFkZUr82es2dYrSUlgDkyPWprd6r16phUriuKww078XRQ"}, "token_uri": "https://www.googleapis.com/oauth2/v4/token", "access_token": "ya29.GlzrAwXs98i32S3XgitR5dwFMm56FuR9_OX5PHxuWpHBadC40CqsAXCjrMXGePFjAzDKfaXDdMlsiljgs-zkxR-DidrQX8SGGK3ThywdvWFrajYsVEXYAABUKimBCw", "invalid": false, "id_token": {"name": "Louis Barranqueiro", "sub": "103013731215211267737", "family_name": "Barranqueiro", "email_verified": true, "given_name": "Louis", "at_hash": "Uy72zB34F1UmLBW6WHluRg", "iat": 1486448464, "locale": "fr", "email": "louis.barranqueiro@gmail.com", "picture": "https://lh6.googleusercontent.com/-MM1hA0HWhs4/AAAAAAAAAAI/AAAAAAAAAAA/ADPlhfIp7PRt1l5l17DOgQNfugg1f8EX7w/s96-c/photo.jpg", "iss": "https://accounts.google.com", "azp": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "aud": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "exp": 1486452064}}',
                user: {
                    id: 1,
                    name: 'Acme Support'
                },
                user_id: 1,
                created_datetime: '2017-02-07T06:21:05.617561+00:00',
                type: null,
                id: 1,
                integrations: [5],
                updated_datetime: '2017-02-07T06:21:05.618384+00:00'
            }],
            type: 'gmail',
            id: 5,
            description: null,
            updated_datetime: '2017-02-07T06:21:05.655015+00:00',
            smooch: null
        }, {
            deleted_datetime: null,
            mappings: [{
                source_key: 'args.bayaname',
                destination_key: 'requester.customer.surname',
                order: 0,
                id: 2
            }
            ],
            meta: {},
            facebook: null,
            http: {
                method: 'GET',
                form: null,
                headers: {},
                execution_order: 1,
                url: 'http://httpbin.org/get?bayaname={{ticket.requester.customer.name}}',
                request_content_type: 'application/json',
                id: 2,
                triggers: {
                    'ticket-created': true,
                    'ticket-updated': true
                },
                response_content_type: 'application/json'
            },
            deactivated_datetime: null,
            name: 'Backoffice Integration 2',
            user: {
                id: 2
            },
            uri: '/api/integrations/3/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:45.097894+00:00',
            connections: [],
            type: 'http',
            id: 3,
            description: 'Test multi-step',
            updated_datetime: '2017-02-07T06:07:45.097905+00:00',
            smooch: null
        }, {
            deleted_datetime: null,
            mappings: [{
                source_key: 'args.name',
                destination_key: 'requester.customer.name',
                order: 0,
                id: 1
            }],
            meta: {
                foo: 'bar'
            },
            facebook: null,
            http: {
                method: 'GET',
                form: null,
                headers: {},
                execution_order: 0,
                url: 'http://httpbin.org/get?name={{ticket.requester.name}}',
                request_content_type: 'application/json',
                id: 1,
                triggers: {
                    'ticket-created': true,
                    'ticket-updated': true
                },
                response_content_type: 'application/json'
            },
            deactivated_datetime: null,
            name: 'Backoffice Integration',
            user: {
                id: 2
            },
            uri: '/api/integrations/2/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.764822+00:00',
            connections: [],
            type: 'http',
            id: 2,
            description: 'Get customer data from our backoffice',
            updated_datetime: '2017-02-07T06:07:43.764835+00:00',
            smooch: null
        }, {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'support@acme.gorgias.io',
                preferred: true,
                signature: {
                    text: 'cheers, {{current_user.first_name}}',
                    html: 'cheers, <strong>{{current_user.first_name}}</strong>'
                }
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Support',
            user: {
                id: 2
            },
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            connections: [],
            type: 'email',
            id: 1,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            smooch: null
        }, {
            deleted_datetime: null,
            mappings: [],
            meta: {
                address: 'contact@acme.com',
                preferred: true
            },
            facebook: null,
            http: null,
            deactivated_datetime: null,
            name: 'Acme Contact',
            user: {
                id: 2
            },
            uri: '/api/integrations/1/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            connections: [],
            type: 'email',
            id: 5,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            smooch: null
        }
    ],
    state: {
        loading: {
            integrations: false,
            integration: false
        }
    },
    integration: {
        deleted_datetime: null,
        mappings: [],
        meta: {
            address: 'billing@acme.com',
            preferred: false,
            oauth: {
                status: 'success'
            }
        },
        facebook: null,
        http: null,
        deactivated_datetime: null,
        name: 'Acme Billing',
        user: {
            id: 1
        },
        uri: '/api/integrations/5/',
        decoration: null,
        locked_datetime: null,
        created_datetime: '2017-02-07T06:21:05.654940+00:00',
        connections: [{
            deleted_datetime: null,
            data: '{"_class": "OAuth2Credentials", "token_info_uri": "https://www.googleapis.com/oauth2/v3/tokeninfo", "client_id": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "user_agent": null, "token_expiry": "2017-02-07T07:21:04Z", "refresh_token": null, "revoke_uri": "https://accounts.google.com/o/oauth2/revoke", "client_secret": "P6va3BWOYgp7kt_DCsVUTD3s", "_module": "oauth2client.client", "scopes": ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/gmail.settings.sharing", "https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.send"], "token_response": {"access_token": "ya29.GlzrAwXs98i32S3XgitR5dwFMm56FuR9_OX5PHxuWpHBadC40CqsAXCjrMXGePFjAzDKfaXDdMlsiljgs-zkxR-DidrQX8SGGK3ThywdvWFrajYsVEXYAABUKimBCw", "token_type": "Bearer", "expires_in": 3600, "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImI4M2M0ZTU5YTllMWZiODA5ZTM4ZjkwMmFhMWE4YzVkZjY1ZTk1MmEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0ODY0NDg0NjQsImV4cCI6MTQ4NjQ1MjA2NCwiYXRfaGFzaCI6IlV5NzJ6QjM0RjFVbUxCVzZXSGx1UmciLCJhdWQiOiI1MzM4MjQyMDc1MzItNW1oMzdtbmhsOGNjbm4ycWc0Z3AxNTBiamVibjlhMWkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDMwMTM3MzEyMTUyMTEyNjc3MzciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiNTMzODI0MjA3NTMyLTVtaDM3bW5obDhjY25uMnFnNGdwMTUwYmplYm45YTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJsb3Vpcy5iYXJyYW5xdWVpcm9AZ21haWwuY29tIiwibmFtZSI6IkxvdWlzIEJhcnJhbnF1ZWlybyIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLU1NMWhBMEhXaHM0L0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FEUGxoZklwN1BSdDFsNWwxN0RPZ1FOZnVnZzFmOEVYN3cvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkxvdWlzIiwiZmFtaWx5X25hbWUiOiJCYXJyYW5xdWVpcm8iLCJsb2NhbGUiOiJmciJ9.TN4rZIBQIIB33xUiadHp4uKHD-NKif9em9VYm3ZmvvfMPlN-cBzSjFQwRurJmt8uHgIv19oohJXTvfgid5KmtyRoWpMgy2AZmk_Dz1cmTcqsZT4pCqmHDssi73HfnyGftAHitE82kn3bna_mpF839LGQGrB-gk4Jb03qud--fz1igjNGfSjAL_lcowMQvNIjmX0dYonJb1Hg0UOuloyfajuUmqumGM9jIANhUu6-QEsMZyuM-grVX8DKNqRY0sn0udiybZwFugit-t6v9kZ6j4CGOT4CnhdwWc745x9--gFkZUr82es2dYrSUlgDkyPWprd6r16phUriuKww078XRQ"}, "token_uri": "https://www.googleapis.com/oauth2/v4/token", "access_token": "ya29.GlzrAwXs98i32S3XgitR5dwFMm56FuR9_OX5PHxuWpHBadC40CqsAXCjrMXGePFjAzDKfaXDdMlsiljgs-zkxR-DidrQX8SGGK3ThywdvWFrajYsVEXYAABUKimBCw", "invalid": false, "id_token": {"name": "Louis Barranqueiro", "sub": "103013731215211267737", "family_name": "Barranqueiro", "email_verified": true, "given_name": "Louis", "at_hash": "Uy72zB34F1UmLBW6WHluRg", "iat": 1486448464, "locale": "fr", "email": "louis.barranqueiro@gmail.com", "picture": "https://lh6.googleusercontent.com/-MM1hA0HWhs4/AAAAAAAAAAI/AAAAAAAAAAA/ADPlhfIp7PRt1l5l17DOgQNfugg1f8EX7w/s96-c/photo.jpg", "iss": "https://accounts.google.com", "azp": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "aud": "533824207532-5mh37mnhl8ccnn2qg4gp150bjebn9a1i.apps.googleusercontent.com", "exp": 1486452064}}',
            user: {
                id: 1,
                name: 'Acme Support'
            },
            user_id: 1,
            created_datetime: '2017-02-07T06:21:05.617561+00:00',
            type: null,
            id: 1,
            integrations: [5],
            updated_datetime: '2017-02-07T06:21:05.618384+00:00'
        }],
        type: 'gmail',
        id: 5,
        description: null,
        updated_datetime: '2017-02-07T06:21:05.655015+00:00',
        smooch: null
    }
}
