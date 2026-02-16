import { Product, productConfig } from 'routes/layout/productConfig'
import { renderHookWithRouter } from 'tests/renderHookWithRouter'

import { useCurrentRouteProduct } from '../useCurrentRouteProduct'

describe('useCurrentRouteProduct', () => {
    it.each([
        {
            path: '/app/home',
            expectedProduct: Product.Home,
            description: 'home path',
        },
        {
            path: '/app/tickets',
            expectedProduct: Product.Inbox,
            description: 'tickets path',
        },
        {
            path: '/app/ticket/123',
            expectedProduct: Product.Inbox,
            description: 'ticket detail path',
        },
        {
            path: '/app/ai-agent',
            expectedProduct: Product.AiAgent,
            description: 'ai-agent path',
        },
        {
            path: '/app/ai-journey',
            expectedProduct: Product.Marketing,
            description: 'ai-journey path',
        },
        {
            path: '/app/stats',
            expectedProduct: Product.Analytics,
            description: 'stats path',
        },
        {
            path: '/app/workflows',
            expectedProduct: Product.Workflows,
            description: 'workflows path',
        },
        {
            path: '/app/customers',
            expectedProduct: Product.Customers,
            description: 'customers path',
        },
        {
            path: '/app/settings',
            expectedProduct: Product.Settings,
            description: 'settings path',
        },
        {
            path: '/app/settings/users',
            expectedProduct: Product.Settings,
            description: 'nested settings path',
        },
        {
            path: '/app/unknown',
            expectedProduct: Product.Inbox,
            description: 'unknown path (default)',
        },
        {
            path: '/app/',
            expectedProduct: Product.Inbox,
            description: 'root app path (default)',
        },
    ])(
        'should return $expectedProduct product when on $description',
        ({ path, expectedProduct }) => {
            const { result } = renderHookWithRouter(
                () => useCurrentRouteProduct(),
                {
                    initialEntries: [path],
                },
            )

            expect(result.current).toEqual(productConfig[expectedProduct])
        },
    )
})
