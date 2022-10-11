import {
    ViewCategory,
    ViewField,
    ViewType,
    ViewVisibility,
} from 'models/view/types'
import {OrderDirection} from 'models/api/types'
import {IntegrationType} from 'models/integration/constants'
import {TicketChannel} from 'business/types/ticket'
import {GorgiasInitialState} from '../types'

import planFixture from './plan'
import {user} from './users'
import {account} from './account'
import {products} from './productPrices'

export const initialState: GorgiasInitialState = {
    agents: {
        all: [user],
    },
    billing: {
        plans: {
            [planFixture.id]: planFixture,
        },
        products: products,
    },
    chats: {
        tickets: [
            {
                channel: TicketChannel.Chat,
                customer: {
                    email: 'marie@gorgias.io',
                    id: 4,
                    name: 'Marie Curie',
                },
                id: 32,
                is_unread: true,
                last_message_datetime: '2020-10-20T06:06:28.223864',
            },
        ],
    },
    currentAccount: account,
    currentUser: user,
    integrations: {
        authentication: {
            aircall: {
                show_old_url: false,
                webhook_url:
                    'https://incoming.gorgias.xyz/api/incoming/aircall/BqarjZ9LD2nbGxV9OPdv5Q3zY4eo617w/',
                webhook_url_new:
                    'https://incoming.gorgias.xyz/api/incoming/aircall/nZMRyOXmzx4QD53kXvpebGljr09B2kE6/',
            },
            email: {
                forwarding_email_address: 'zp7d01g9zorymjke@emails.gorgias.xyz',
            },
            facebook: {
                redirect_uri:
                    'https://www.facebook.com/v10.0/dialog/oauth?client_id=397863240692179&redirect_uri=https%3A%2F%2Faccounts.gorgias.xyz%2Fintegrations%2Ffacebook%2Fauth%2Fcallback&response_type=token&scope=pages_manage_ads%2Cpages_manage_metadata%2Cpages_read_engagement%2Cpages_read_user_content%2Cpages_manage_posts%2Cpages_manage_engagement%2Cbusiness_management%2Cpages_show_list%2Cread_page_mailboxes%2Cpages_messaging%2Cpages_messaging_subscriptions%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_messages%2Cads_read%2Cads_management&state=eyJhY2NvdW50X2RvbWFpbiI6ICJhY21lIiwgImlzX3JlY29ubmVjdCI6IGZhbHNlfQ%3D%3D',
                redirect_uri_reconnect:
                    'https://www.facebook.com/v10.0/dialog/oauth?client_id=397863240692179&redirect_uri=https%3A%2F%2Faccounts.gorgias.xyz%2Fintegrations%2Ffacebook%2Fauth%2Fcallback&response_type=token&scope=pages_manage_ads%2Cpages_manage_metadata%2Cpages_read_engagement%2Cpages_read_user_content%2Cpages_manage_posts%2Cpages_manage_engagement%2Cbusiness_management%2Cpages_show_list%2Cread_page_mailboxes%2Cpages_messaging%2Cpages_messaging_subscriptions%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_messages%2Cads_read%2Cads_management&state=eyJhY2NvdW50X2RvbWFpbiI6ICJhY21lIiwgImlzX3JlY29ubmVjdCI6IHRydWV9',
            },
            gmail: {
                redirect_uri: '/integrations/gmail/auth/pre-callback',
            },
            magento2: {
                redirect_uri: '/integrations/magento2/auth/pre-callback/',
            },
            outlook: {
                redirect_uri: '/integrations/outlook/auth/pre-callback/',
            },
            recharge: {
                redirect_uri: '/integrations/recharge/auth/pre-callback/',
            },
            shopify: {
                redirect_uri:
                    'https://{shop_name}.myshopify.com/admin/oauth/authorize?client_id=0d5570af054ce903798f1ae621c02291&scope=read_all_orders%2Cread_orders%2Cwrite_orders%2Cwrite_order_edits%2Cread_order_edits%2Cread_customers%2Cwrite_customers%2Cread_themes%2Cwrite_themes%2Cread_products%2Cread_draft_orders%2Cwrite_draft_orders&redirect_uri=https%3A%2F%2Faccounts.gorgias.xyz%2Fintegrations%2Fshopify%2Fauth%2Fcallback%2F&state=eyJhY2NvdW50X2RvbWFpbiI6ICJhY21lIn0%3D',
            },
            smile: {
                redirect_uri:
                    'https://connect.smile.io/oauth2/authorize?redirect_uri=https%3A%2F%2Faccounts.gorgias.xyz%2Fintegrations%2Fsmile%2Fauth%2Fcallback%2F&client_id=08YEKLFR5jmB0oDujlh8nFUDIaTK3PjWxOAj2HTmWj8&state=eyJhY2NvdW50X2RvbWFpbiI6ICJhY21lIn0%3D&response_type=code',
            },
            smooch: {
                redirect_uri:
                    'https://app.smooch.io/oauth/authorize/?client_id=gorgias_dev&response_type=code&state=eyJhY2NvdW50X2RvbWFpbiI6ICJhY21lIn0%3D&redirect_uri=https%3A%2F%2Faccounts.gorgias.xyz%2Fintegrations%2Fsmooch%2Fauth%2Fcallback%2F',
            },
            twitter: {
                redirect_uri: '/integrations/twitter/auth/pre-callback/',
            },
            yotpo: {
                redirect_uri: '/integrations/yotpo/auth/pre-callback/',
            },
        },
        extra: {
            [IntegrationType.Facebook]: {
                max_account_ads: 100,
            },
            [IntegrationType.GorgiasChat]: {
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
                decoration: {
                    color: '#ABB8C3',
                },
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
                category: ViewCategory.System,
                created_datetime: '2020-10-20T14:57:27.612323+00:00',
                deactivated_datetime: null,
                decoration: null,
                fields: [
                    ViewField.Name,
                    ViewField.Email,
                    ViewField.Created,
                    ViewField.Updated,
                ],
                filters: 'eq(user.roles.name, "user")',
                filters_ast: {},
                group_by: null,
                id: 9,
                name: 'All customers',
                order_by: 'updated_datetime' as ViewField,
                order_dir: OrderDirection.Desc,
                search: null,
                slug: 'all-customers',
                type: ViewType.CustomerList,
                uri: '/api/views/9/',
                visibility: ViewVisibility.Public,
                section_id: null,
            },
        ],
        recent: {
            '9': {
                inserted_datetime: '2020-10-28T09:23:35.294Z',
                updated_datetime: '2020-10-28T09:23:35.294Z',
            },
        },
    },
    phoneNumbers: [],
}
