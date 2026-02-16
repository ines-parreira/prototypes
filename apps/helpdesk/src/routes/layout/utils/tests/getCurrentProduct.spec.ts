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
})
