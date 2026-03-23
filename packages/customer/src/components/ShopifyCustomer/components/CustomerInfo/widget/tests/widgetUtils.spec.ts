import type { Widget } from '@gorgias/helpdesk-types'

import {
    applyOptimisticWidgetUpdate,
    findNestedWidget,
    findShopifyWidget,
} from '../widgetUtils'

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

describe('findNestedWidget', () => {
    it('finds the widget with the given path', () => {
        const template = {
            widgets: [
                { path: 'order', type: 'order' },
                { path: 'customer', type: 'customer' },
            ],
        }
        expect(findNestedWidget(template, 'customer')).toBe(template.widgets[1])
    })

    it('returns undefined for undefined template', () => {
        expect(findNestedWidget(undefined, 'customer')).toBeUndefined()
    })

    it('returns undefined when no widget matches path', () => {
        const template = {
            widgets: [{ path: 'order', type: 'order' }],
        }
        expect(findNestedWidget(template, 'customer')).toBeUndefined()
    })

    it('returns undefined when widgets array is empty', () => {
        expect(findNestedWidget({ widgets: [] }, 'customer')).toBeUndefined()
    })
})

describe('applyOptimisticWidgetUpdate', () => {
    const updatedTemplate = { type: 'updated' }

    it('returns undefined when old is undefined', () => {
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

    it('preserves other properties on the outer structure', () => {
        const old = {
            data: {
                data: [
                    {
                        id: 1,
                        type: 'shopify',
                        context: 'ticket',
                    },
                ] as unknown as Widget[],
                meta: { total: 1 },
            },
        }
        const result = applyOptimisticWidgetUpdate(old, 1, updatedTemplate)
        expect((result!.data.data[0] as any).context).toBe('ticket')
        expect((result!.data as any).meta).toEqual({ total: 1 })
    })
})
