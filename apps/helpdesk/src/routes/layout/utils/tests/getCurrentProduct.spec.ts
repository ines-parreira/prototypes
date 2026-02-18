import { Product, productConfig } from 'routes/layout/productConfig'

import { getCurrentProduct } from '../getCurrentProduct'

describe('getCurrentProduct', () => {
    it.each([
        ['/app/home', Product.Home, 'Home'],
        ['/app/tickets', Product.Inbox, 'Inbox'],
        ['/app/ticket/123', Product.Inbox, 'Inbox'],
        ['/app/views', Product.Inbox, 'Inbox'],
        ['/app/ai-agent', Product.AiAgent, 'AiAgent'],
        ['/app/automation', Product.AiAgent, 'AiAgent'],
        ['/app/ai-journey', Product.Marketing, 'Marketing'],
        ['/app/stats', Product.Analytics, 'Analytics'],
        ['/app/voice-of-customer', Product.Analytics, 'Analytics'],
        ['/app/workflows', Product.Workflows, 'Workflows'],
        ['/app/customers', Product.Customers, 'Customers'],
        ['/app/customer/123', Product.Customers, 'Customers'],
        ['/app/settings', Product.Settings, 'Settings'],
        ['/app/settings/users', Product.Settings, 'Settings'],
    ])('should return %s product for %s path', (path, expectedProduct) => {
        const result = getCurrentProduct(path)
        expect(result).toEqual(productConfig[expectedProduct])
    })

    it.each([
        ['/app/unknown', 'unknown path'],
        ['/app/', 'root path'],
        ['/app', 'empty app path'],
    ])('should return default Inbox product for %s', (path) => {
        const result = getCurrentProduct(path)
        expect(result).toEqual(productConfig[Product.Inbox])
    })

    describe('workflows routes', () => {
        it.each([
            ['/app/workflows/flows', Product.Workflows, 'Flows'],
            ['/app/workflows/macros', Product.Workflows, 'Macros'],
            ['/app/workflows/rules', Product.Workflows, 'Rules'],
            ['/app/workflows/sla', Product.Workflows, 'SLAs'],
            ['/app/workflows/satisfaction-surveys', Product.Workflows, 'CSAT'],
        ])(
            'should return %s product for specific workflow route %s',
            (path, expectedProduct) => {
                const result = getCurrentProduct(path)
                expect(result).toEqual(productConfig[expectedProduct])
            },
        )
    })

    describe('legacy workflows routes', () => {
        it.each([
            ['/app/settings/macros', Product.Workflows, 'Macros'],
            ['/app/settings/rules', Product.Workflows, 'Rules'],
            ['/app/settings/sla', Product.Workflows, 'SLAs'],
            ['/app/settings/flows', Product.Workflows, 'Flows'],
            [
                '/app/settings/order-management',
                Product.Workflows,
                'Order Management',
            ],
            [
                '/app/settings/article-recommendations',
                Product.Workflows,
                'Article Recommendations',
            ],
            ['/app/settings/satisfaction-surveys', Product.Workflows, 'CSAT'],
            ['/app/settings/ticket-fields', Product.Workflows, 'Ticket Fields'],
            [
                '/app/settings/customer-fields',
                Product.Workflows,
                'Customer Fields',
            ],
            [
                '/app/settings/ticket-field-conditions',
                Product.Workflows,
                'Field Conditions',
            ],
            ['/app/settings/manage-tags', Product.Workflows, 'Tags'],
            [
                '/app/settings/ticket-assignment',
                Product.Workflows,
                'Ticket Assignment',
            ],
            ['/app/settings/auto-merge', Product.Workflows, 'Auto-merge'],
        ])(
            'should return Workflows product for legacy settings route %s',
            (path, expectedProduct) => {
                const result = getCurrentProduct(path)
                expect(result).toEqual(productConfig[expectedProduct])
            },
        )

        it.each([
            ['/app/settings/users', Product.Settings, 'Users'],
            ['/app/settings/account', Product.Settings, 'Account'],
            ['/app/settings/integrations', Product.Settings, 'Integrations'],
            ['/app/settings/channels', Product.Settings, 'Channels'],
            ['/app/settings/billing', Product.Settings, 'Billing'],
        ])(
            'should return Settings product for non-workflows settings route %s',
            (path, expectedProduct) => {
                const result = getCurrentProduct(path)
                expect(result).toEqual(productConfig[expectedProduct])
            },
        )
    })
})
