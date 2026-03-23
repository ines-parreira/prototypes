import type { Widget } from '@gorgias/helpdesk-types'

import type { WidgetTemplate } from '../customActionTypes'
import {
    applyOptimisticWidgetUpdate,
    buildInitialTemplate,
    findCustomerWidget,
    findShopifyWidget,
    updateCustomerWidget,
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
