import type { Widget } from '@gorgias/helpdesk-types'

import type { WidgetTemplate } from '../customActionTypes'
import {
    applyOptimisticWidgetUpdate,
    buildInitialOrderTemplate,
    buildInitialTemplate,
    findCustomerWidget,
    findOrderWidget,
    findShopifyWidget,
    readLegacyOrderCustomActions,
    updateCustomerWidget,
    updateOrderCustomActionsWidget,
} from '../customActionWidgetUtils'

describe('findCustomerWidget', () => {
    it('finds the widget with path "customer"', () => {
        const template: WidgetTemplate = {
            widgets: [
                { path: 'order', type: 'order' },
                { path: 'customer', type: 'customer' },
            ],
        }
        expect(findCustomerWidget(template)).toBe(template.widgets![1])
    })

    it('returns undefined for undefined template', () => {
        expect(findCustomerWidget(undefined)).toBeUndefined()
    })

    it('returns undefined when no customer widget exists', () => {
        const template: WidgetTemplate = {
            widgets: [{ path: 'order', type: 'order' }],
        }
        expect(findCustomerWidget(template)).toBeUndefined()
    })

    it('returns undefined when widgets array is empty', () => {
        expect(findCustomerWidget({ widgets: [] })).toBeUndefined()
    })
})

describe('updateCustomerWidget', () => {
    const template: WidgetTemplate = {
        type: 'wrapper',
        widgets: [
            { path: 'order', type: 'order' },
            {
                path: 'customer',
                type: 'customer',
                meta: { existing: 'value' },
            },
        ],
    }

    it('updates the customer widget meta.custom', () => {
        const custom = {
            links: [{ label: 'Link', url: 'https://example.com' }],
            buttons: [],
        }
        const result = updateCustomerWidget(template, custom)
        const customer = result.widgets!.find((w) => w.path === 'customer')
        expect(customer!.meta!.custom).toEqual(custom)
        expect(customer!.meta!.existing).toBe('value')
    })

    it('returns non-customer widgets unchanged by reference', () => {
        const custom = { links: [], buttons: [] }
        const result = updateCustomerWidget(template, custom)
        expect(result.widgets![0]).toBe(template.widgets![0])
    })

    it('handles undefined meta on customer widget', () => {
        const tmpl: WidgetTemplate = {
            widgets: [{ path: 'customer', type: 'customer' }],
        }
        const custom = { links: [], buttons: [] }
        const result = updateCustomerWidget(tmpl, custom)
        expect(result.widgets![0].meta!.custom).toEqual(custom)
    })

    it('appends a customer widget when none exists', () => {
        const orderOnlyTemplate: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'order', type: 'order', widgets: [] }],
        }
        const custom = {
            links: [{ label: 'Customer Link', url: 'https://customer.com' }],
            buttons: [],
        }
        const result = updateCustomerWidget(orderOnlyTemplate, custom)

        expect(result.widgets).toHaveLength(2)
        const customer = result.widgets!.find((w) => w.path === 'customer')
        expect(customer).toEqual({
            path: 'customer',
            type: 'customer',
            meta: { custom },
        })
    })

    it('appends a customer widget when widgets array is empty', () => {
        const emptyTemplate: WidgetTemplate = {
            type: 'wrapper',
            widgets: [],
        }
        const custom = {
            links: [{ label: 'L', url: 'https://l.com' }],
            buttons: [],
        }
        const result = updateCustomerWidget(emptyTemplate, custom)

        expect(result.widgets).toHaveLength(1)
        expect(result.widgets![0]).toEqual({
            path: 'customer',
            type: 'customer',
            meta: { custom },
        })
    })

    it('appends a customer widget when widgets is undefined', () => {
        const noWidgetsTemplate: WidgetTemplate = { type: 'wrapper' }
        const custom = { links: [], buttons: [] }
        const result = updateCustomerWidget(noWidgetsTemplate, custom)

        expect(result.widgets).toEqual([
            {
                path: 'customer',
                type: 'customer',
                meta: { custom },
            },
        ])
    })

    it('preserves the order widget unchanged by reference when appending the customer widget', () => {
        const orderOnlyTemplate: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'order', type: 'order', widgets: [] }],
        }
        const custom = { links: [], buttons: [] }
        const result = updateCustomerWidget(orderOnlyTemplate, custom)

        expect(result.widgets![0]).toBe(orderOnlyTemplate.widgets![0])
    })

    it('preserves sibling meta.custom keys on the existing customer widget', () => {
        const tmpl: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                {
                    path: 'customer',
                    type: 'customer',
                    meta: { custom: { someOtherKey: 'preserved' } },
                },
            ],
        }
        const custom = {
            links: [{ label: 'L', url: 'https://l.com' }],
            buttons: [],
        }
        const result = updateCustomerWidget(tmpl, custom)
        const customer = result.widgets!.find((w) => w.path === 'customer')
        expect(customer!.meta!.custom).toEqual({
            someOtherKey: 'preserved',
            ...custom,
        })
    })
})

describe('findShopifyWidget', () => {
    it('finds shopify widget with ticket context', () => {
        const widgets = [
            { id: 1, type: 'other', context: 'ticket' },
            { id: 2, type: 'shopify', context: 'ticket' },
        ] as Widget[]
        expect(findShopifyWidget(widgets)).toBe(widgets[1])
    })

    it('ignores shopify widget with non-ticket context', () => {
        const widgets = [
            { id: 1, type: 'shopify', context: 'customer' },
        ] as Widget[]
        expect(findShopifyWidget(widgets)).toBeUndefined()
    })

    it('returns undefined for empty array', () => {
        expect(findShopifyWidget([])).toBeUndefined()
    })
})

describe('buildInitialTemplate', () => {
    it('creates correct structure', () => {
        const custom = {
            links: [{ label: 'L', url: 'https://l.com' }],
            buttons: [
                {
                    label: 'B',
                    action: {
                        method: 'GET' as const,
                        url: 'https://b.com',
                        headers: [],
                        params: [],
                        body: {
                            contentType: 'application/json' as const,
                            'application/json': {},
                            'application/x-www-form-urlencoded': [],
                        },
                    },
                },
            ],
        }
        const result = buildInitialTemplate(custom)
        expect(result).toEqual({
            type: 'wrapper',
            widgets: [
                {
                    path: 'customer',
                    type: 'customer',
                    meta: { custom },
                },
            ],
        })
    })
})

describe('findOrderWidget', () => {
    it('finds the widget with path "order"', () => {
        const template: WidgetTemplate = {
            widgets: [
                { path: 'customer', type: 'customer' },
                { path: 'order', type: 'order' },
            ],
        }
        expect(findOrderWidget(template)).toBe(template.widgets![1])
    })

    it('returns undefined for undefined template', () => {
        expect(findOrderWidget(undefined)).toBeUndefined()
    })

    it('returns undefined when no order widget exists', () => {
        const template: WidgetTemplate = {
            widgets: [{ path: 'customer', type: 'customer' }],
        }
        expect(findOrderWidget(template)).toBeUndefined()
    })

    it('returns undefined when widgets array is empty', () => {
        expect(findOrderWidget({ widgets: [] })).toBeUndefined()
    })
})

describe('updateOrderCustomActionsWidget', () => {
    const customWithActions = {
        links: [{ label: 'Link', url: 'https://example.com' }],
        buttons: [],
    }

    it('updates an existing order widget meta.custom', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                { path: 'customer', type: 'customer' },
                {
                    path: 'order',
                    type: 'order',
                    widgets: [],
                    meta: { existing: 'value' },
                },
            ],
        }
        const result = updateOrderCustomActionsWidget(
            template,
            customWithActions,
        )
        const order = result.widgets!.find((w) => w.path === 'order')
        expect(order!.meta!.custom).toEqual(customWithActions)
        expect(order!.meta!.existing).toBe('value')
    })

    it('preserves existing orderSectionPreferences when adding custom actions', () => {
        const orderSectionPreferences = {
            details: { fields: [{ id: 'id', visible: true }] },
        }
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                {
                    path: 'order',
                    type: 'order',
                    widgets: [],
                    meta: { custom: { orderSectionPreferences } },
                },
            ],
        }
        const result = updateOrderCustomActionsWidget(
            template,
            customWithActions,
        )
        const order = result.widgets!.find((w) => w.path === 'order')
        expect(order!.meta!.custom).toEqual({
            orderSectionPreferences,
            ...customWithActions,
        })
    })

    it('appends an order widget when none exists', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'customer', type: 'customer' }],
        }
        const result = updateOrderCustomActionsWidget(
            template,
            customWithActions,
        )
        expect(result.widgets).toHaveLength(2)
        const order = result.widgets!.find((w) => w.path === 'order')
        expect(order).toEqual({
            path: 'order',
            type: 'order',
            widgets: [],
            meta: { custom: customWithActions },
        })
    })

    it('returns customer widget unchanged by reference', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                { path: 'customer', type: 'customer' },
                { path: 'order', type: 'order', widgets: [] },
            ],
        }
        const result = updateOrderCustomActionsWidget(
            template,
            customWithActions,
        )
        expect(result.widgets![0]).toBe(template.widgets![0])
    })
})

describe('buildInitialOrderTemplate', () => {
    it('creates a wrapper template with a single order widget', () => {
        const custom = {
            links: [{ label: 'L', url: 'https://l.com' }],
            buttons: [],
        }
        expect(buildInitialOrderTemplate(custom)).toEqual({
            type: 'wrapper',
            widgets: [
                {
                    path: 'order',
                    type: 'order',
                    widgets: [],
                    meta: { custom },
                },
            ],
        })
    })
})

describe('applyOptimisticWidgetUpdate', () => {
    const updatedTemplate: WidgetTemplate = { type: 'updated' }

    it('returns old unchanged when undefined', () => {
        expect(
            applyOptimisticWidgetUpdate(undefined, 1, updatedTemplate),
        ).toBeUndefined()
    })

    it('returns old unchanged when data.data is missing', () => {
        const old = { data: {} } as { data: { data: Widget[] } }
        expect(applyOptimisticWidgetUpdate(old, 1, updatedTemplate)).toBe(old)
    })

    it('updates only the matching widget by id', () => {
        const old = {
            data: {
                data: [
                    { id: 1, type: 'shopify' },
                    { id: 2, type: 'other' },
                ] as Widget[],
            },
        }
        const result = applyOptimisticWidgetUpdate(old, 1, updatedTemplate)!
        expect(result.data.data[0]).toEqual({
            id: 1,
            type: 'shopify',
            template: updatedTemplate,
        })
        expect(result.data.data[1]).toBe(old.data.data[1])
    })
})

describe('readLegacyOrderCustomActions', () => {
    it('returns links and buttons from the legacy orders list inner card template', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                { path: 'customer', type: 'card' },
                {
                    path: 'orders',
                    type: 'list',
                    widgets: [
                        {
                            type: 'card',
                            title: 'Order {{name}}',
                            meta: {
                                custom: {
                                    links: [
                                        {
                                            label: 'legacy order widget link',
                                            url: 'https://www.google.com',
                                        },
                                    ],
                                    buttons: [],
                                },
                            },
                        },
                    ],
                },
            ],
        }
        expect(readLegacyOrderCustomActions(template)).toEqual({
            links: [
                {
                    label: 'legacy order widget link',
                    url: 'https://www.google.com',
                },
            ],
            buttons: [],
        })
    })

    it('returns empty arrays when the orders list is missing', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'customer', type: 'card' }],
        }
        expect(readLegacyOrderCustomActions(template)).toEqual({
            links: [],
            buttons: [],
        })
    })

    it('returns empty arrays when the orders list has no inner card template', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'orders', type: 'list', widgets: [] }],
        }
        expect(readLegacyOrderCustomActions(template)).toEqual({
            links: [],
            buttons: [],
        })
    })

    it('returns empty arrays when the inner card template has no meta.custom', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                {
                    path: 'orders',
                    type: 'list',
                    widgets: [{ type: 'card', title: 'Order' }],
                },
            ],
        }
        expect(readLegacyOrderCustomActions(template)).toEqual({
            links: [],
            buttons: [],
        })
    })

    it('returns empty arrays when template is undefined', () => {
        expect(readLegacyOrderCustomActions(undefined)).toEqual({
            links: [],
            buttons: [],
        })
    })
})
