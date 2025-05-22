import { EmailProvider } from 'models/integration/constants'
import {
    Integration,
    IntegrationType,
    StoreIntegration,
} from 'models/integration/types'

import { StoreWithAssignedChannels } from './types'

export const mockStoresWithAssignedChannels: StoreWithAssignedChannels[] = [
    {
        store: {
            id: 1,
            name: 'test-1',
            type: IntegrationType.Shopify,
            url: 'www.test-1.com',
            uri: 'www.test-1.com',
            meta: {
                oauth: {
                    access_token: 'test-token',
                    refresh_token: 'test-refresh-token',
                    expires_in: 3600,
                    scope: ['read_products', 'write_products'],
                    status: 'success',
                    error: null,
                },
                shop_name: 'test-1',
                shop_domain: 'www.test-1.com',
                currency: 'USD',
                webhooks: [],
            },
        } as unknown as StoreIntegration,
        assignedChannels: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'Email',
                uri: 'address1',
                meta: {
                    address: 'test@test-1.com',
                    preferred: true,
                    provider: EmailProvider.Mailgun,
                    outbound_verification_status: {
                        single_sender: 'verified',
                        domain: 'verified',
                    },
                },
            },
            {
                id: 2,
                type: IntegrationType.GorgiasChat,
                name: 'Chat',
                uri: 'address2',
                meta: {
                    app_id: 'test-app-id',
                    language: 'en',
                    self_service: {
                        enabled: true,
                        configurations: [],
                    },
                    status: 'active',
                    preferences: {
                        email_capture_enforcement: 'optional',
                    },
                },
            },
            {
                id: 3,
                type: IntegrationType.Facebook,
                name: 'Facebook',
                uri: 'address3',
            },
        ] as unknown as Integration[],
    },
    {
        store: {
            id: 2,
            name: 'test-2',
            type: IntegrationType.BigCommerce,
            url: 'www.test-2.com',
            uri: 'www.test-2.com',
            meta: {
                oauth: {
                    access_token: 'test-token',
                    refresh_token: 'test-refresh-token',
                    expires_in: 3600,
                    scope: ['store_v2'],
                    status: 'success',
                    error: null,
                },
                store_hash: 'test-hash',
                shop_domain: 'www.test-2.com',
                shop_id: 123,
                webhooks: [],
                currency: 'USD',
            },
        } as unknown as StoreIntegration,
        assignedChannels: [
            {
                id: 4,
                type: IntegrationType.Http,
                name: 'Helpcenter',
                uri: 'address4',
                meta: {},
                http: {
                    url: 'https://help.test-2.com',
                },
            },
            {
                id: 5,
                type: IntegrationType.Http,
                name: 'Contact Form',
                uri: 'address5',
                meta: {},
                http: {
                    url: 'https://contact.test-2.com',
                },
            },
            {
                id: 6,
                type: IntegrationType.WhatsApp,
                name: 'WhatsApp',
                uri: 'address6',
                meta: {
                    phone_number_id: 123,
                    routing: {
                        phone_number: '+1234567890',
                    },
                },
            },
        ] as unknown as Integration[],
    },
    {
        store: {
            id: 3,
            name: 'test-3',
            type: IntegrationType.Magento2,
            url: 'www.test-3.com',
            uri: 'www.test-3.com',
            meta: {
                store_url: 'www.test-3.com',
                is_manual: false,
                import_state: {
                    is_over: true,
                },
            },
        } as unknown as StoreIntegration,
        assignedChannels: [
            {
                id: 7,
                type: IntegrationType.Email,
                name: 'Email',
                uri: 'address7',
                meta: {
                    address: 'test@test-3.com',
                    preferred: true,
                    provider: EmailProvider.Mailgun,
                    outbound_verification_status: {
                        single_sender: 'verified',
                        domain: 'verified',
                    },
                },
            },
        ] as unknown as Integration[],
    },
]
