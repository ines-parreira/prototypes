import type { Widget } from '@gorgias/helpdesk-types'

import {
    buildCreateWidgetPayload,
    buildDefaultPreferences,
    buildInitialTemplate,
    buildOptimisticWidgetListUpdate,
    buildPreferencesFromStored,
    buildUpdatedTemplate,
    findOrderWidget,
    initSections,
    sectionsEqual,
} from '../orderFieldPreferences.utils'
import type {
    OrderNestedWidget,
    SectionState,
    WidgetTemplate,
} from '../orderFieldPreferences.utils'
import type { OrderFieldPreferences, OrderSectionKey } from '../types'

describe('buildDefaultPreferences', () => {
    it('returns sections for all 5 ORDER_SECTION_CONFIGS keys', () => {
        const prefs = buildDefaultPreferences()
        const keys = Object.keys(prefs.sections)
        expect(keys).toEqual(
            expect.arrayContaining([
                'orderDetails',
                'lineItems',
                'shipping',
                'shippingAddress',
                'billingAddress',
            ]),
        )
        expect(keys).toHaveLength(5)
    })

    it('returns empty fields for non-configurable sections', () => {
        const prefs = buildDefaultPreferences()
        expect(prefs.sections.lineItems?.fields).toEqual([])
        expect(prefs.sections.shippingAddress?.fields).toEqual([])
        expect(prefs.sections.billingAddress?.fields).toEqual([])
    })

    it('returns all field IDs with visible: true for configurable sections', () => {
        const prefs = buildDefaultPreferences()
        const orderDetailsFields = prefs.sections.orderDetails!.fields
        expect(orderDetailsFields.length).toBeGreaterThan(0)
        expect(orderDetailsFields.every((f) => f.visible)).toBe(true)

        const shippingFields = prefs.sections.shipping!.fields
        expect(shippingFields.length).toBeGreaterThan(0)
        expect(shippingFields.every((f) => f.visible)).toBe(true)
    })
})

describe('findOrderWidget', () => {
    it('returns undefined for undefined template', () => {
        expect(findOrderWidget(undefined)).toBeUndefined()
    })

    it('returns undefined for template with empty widgets', () => {
        expect(findOrderWidget({ widgets: [] })).toBeUndefined()
    })

    it('returns undefined when no widget has path "order"', () => {
        const template: WidgetTemplate = {
            widgets: [{ path: 'customer', type: 'customer' }],
        }
        expect(findOrderWidget(template)).toBeUndefined()
    })

    it('returns the widget with path "order"', () => {
        const orderWidget: OrderNestedWidget = {
            path: 'order',
            type: 'order',
        }
        const template: WidgetTemplate = {
            widgets: [{ path: 'customer', type: 'customer' }, orderWidget],
        }
        expect(findOrderWidget(template)).toBe(orderWidget)
    })
})

describe('buildUpdatedTemplate', () => {
    const prefs: OrderFieldPreferences['sections'] = {
        orderDetails: { fields: [{ id: 'tags', visible: false }] },
    }

    it('updates existing order widget meta', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                {
                    path: 'order',
                    type: 'order',
                    meta: { custom: {}, existingMeta: true },
                },
            ],
        }
        const result = buildUpdatedTemplate(template, prefs)
        const orderWidget = result.widgets!.find((w) => w.path === 'order')!
        expect(orderWidget.meta?.custom?.orderSectionPreferences).toEqual(prefs)
        expect(orderWidget.meta?.existingMeta).toBe(true)
    })

    it('preserves other widgets', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [
                { path: 'customer', type: 'customer' },
                { path: 'order', type: 'order' },
            ],
        }
        const result = buildUpdatedTemplate(template, prefs)
        expect(result.widgets).toHaveLength(2)
        expect(result.widgets![0].path).toBe('customer')
    })

    it('preserves template-level properties', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            extra: 'value',
            widgets: [{ path: 'order', type: 'order' }],
        }
        const result = buildUpdatedTemplate(template, prefs)
        expect(result.type).toBe('wrapper')
        expect(result.extra).toBe('value')
    })

    it('appends new order widget when none exists', () => {
        const template: WidgetTemplate = {
            type: 'wrapper',
            widgets: [{ path: 'customer', type: 'customer' }],
        }
        const result = buildUpdatedTemplate(template, prefs)
        expect(result.widgets).toHaveLength(2)
        const orderWidget = result.widgets!.find((w) => w.path === 'order')!
        expect(orderWidget.meta?.custom?.orderSectionPreferences).toEqual(prefs)
    })

    it('handles undefined widgets array', () => {
        const template: WidgetTemplate = { type: 'wrapper' }
        const result = buildUpdatedTemplate(template, prefs)
        expect(result.widgets).toHaveLength(1)
        expect(result.widgets![0].path).toBe('order')
    })

    it('handles empty widgets array', () => {
        const template: WidgetTemplate = { type: 'wrapper', widgets: [] }
        const result = buildUpdatedTemplate(template, prefs)
        expect(result.widgets).toHaveLength(1)
        expect(result.widgets![0].path).toBe('order')
    })
})

describe('buildInitialTemplate', () => {
    const prefs: OrderFieldPreferences['sections'] = {
        orderDetails: { fields: [{ id: 'tags', visible: true }] },
    }

    it('returns a wrapper template', () => {
        const result = buildInitialTemplate(prefs)
        expect(result.type).toBe('wrapper')
    })

    it('contains a single order widget', () => {
        const result = buildInitialTemplate(prefs)
        expect(result.widgets).toHaveLength(1)
        expect(result.widgets![0].path).toBe('order')
        expect(result.widgets![0].type).toBe('order')
    })

    it('stores preferences in meta.custom', () => {
        const result = buildInitialTemplate(prefs)
        expect(
            result.widgets![0].meta?.custom?.orderSectionPreferences,
        ).toEqual(prefs)
    })

    it('has empty widgets array on the order widget', () => {
        const result = buildInitialTemplate(prefs)
        expect(result.widgets![0].widgets).toEqual([])
    })
})

describe('initSections', () => {
    it('uses stored preferences when present', () => {
        const preferences: OrderFieldPreferences = {
            sections: {
                orderDetails: {
                    fields: [
                        { id: 'tags', visible: false },
                        { id: 'store', visible: true },
                    ],
                    sectionVisible: false,
                },
                lineItems: { fields: [] },
                shipping: {
                    fields: [{ id: 'tracking_url', visible: true }],
                    sectionVisible: true,
                },
                shippingAddress: { fields: [] },
                billingAddress: { fields: [] },
            },
        }
        const result = initSections(preferences)
        expect(result.orderDetails.fields).toEqual([
            { id: 'tags', visible: false },
            { id: 'store', visible: true },
        ])
        expect(result.orderDetails.sectionVisible).toBe(false)
    })

    it('derives sectionVisible from field visibility when not explicitly set', () => {
        const preferences: OrderFieldPreferences = {
            sections: {
                orderDetails: {
                    fields: [
                        { id: 'tags', visible: false },
                        { id: 'store', visible: false },
                    ],
                },
            },
        }
        const result = initSections(preferences)
        expect(result.orderDetails.sectionVisible).toBe(false)
    })

    it('sets sectionVisible true when fields array is empty', () => {
        const preferences: OrderFieldPreferences = {
            sections: {
                orderDetails: { fields: [] },
            },
        }
        const result = initSections(preferences)
        expect(result.orderDetails.sectionVisible).toBe(true)
    })

    it('returns empty fields for non-configurable sections even if stored', () => {
        const preferences: OrderFieldPreferences = {
            sections: {
                lineItems: {
                    fields: [{ id: 'something', visible: true }],
                },
            },
        }
        const result = initSections(preferences)
        expect(result.lineItems.fields).toEqual([])
    })

    it('defaults missing sections to all fields visible and sectionVisible true', () => {
        const preferences: OrderFieldPreferences = { sections: {} }
        const result = initSections(preferences)

        expect(result.orderDetails.sectionVisible).toBe(true)
        expect(result.orderDetails.fields.length).toBeGreaterThan(0)
        expect(result.orderDetails.fields.every((f) => f.visible)).toBe(true)

        expect(result.shipping.sectionVisible).toBe(true)
        expect(result.shipping.fields.length).toBeGreaterThan(0)
        expect(result.shipping.fields.every((f) => f.visible)).toBe(true)
    })

    it('defaults missing non-configurable sections to empty fields and sectionVisible true', () => {
        const preferences: OrderFieldPreferences = { sections: {} }
        const result = initSections(preferences)
        expect(result.lineItems.fields).toEqual([])
        expect(result.lineItems.sectionVisible).toBe(true)
        expect(result.shippingAddress.fields).toEqual([])
        expect(result.shippingAddress.sectionVisible).toBe(true)
    })
})

describe('sectionsEqual', () => {
    function makeSections(
        overrides: Partial<Record<OrderSectionKey, SectionState>> = {},
    ): Record<OrderSectionKey, SectionState> {
        const base: Record<OrderSectionKey, SectionState> = {
            orderDetails: {
                fields: [{ id: 'tags', visible: true }],
                sectionVisible: true,
            },
            lineItems: { fields: [], sectionVisible: true },
            shipping: {
                fields: [{ id: 'tracking_url', visible: true }],
                sectionVisible: true,
            },
            shippingAddress: { fields: [], sectionVisible: true },
            billingAddress: { fields: [], sectionVisible: true },
        }
        return { ...base, ...overrides }
    }

    it('returns true for identical sections', () => {
        const a = makeSections()
        const b = makeSections()
        expect(sectionsEqual(a, b)).toBe(true)
    })

    it('returns false for differing sectionVisible', () => {
        const a = makeSections()
        const b = makeSections({
            orderDetails: {
                fields: [{ id: 'tags', visible: true }],
                sectionVisible: false,
            },
        })
        expect(sectionsEqual(a, b)).toBe(false)
    })

    it('returns false for differing field count', () => {
        const a = makeSections()
        const b = makeSections({
            orderDetails: {
                fields: [
                    { id: 'tags', visible: true },
                    { id: 'store', visible: true },
                ],
                sectionVisible: true,
            },
        })
        expect(sectionsEqual(a, b)).toBe(false)
    })

    it('returns false for differing field id', () => {
        const a = makeSections()
        const b = makeSections({
            orderDetails: {
                fields: [{ id: 'store', visible: true }],
                sectionVisible: true,
            },
        })
        expect(sectionsEqual(a, b)).toBe(false)
    })

    it('returns false for differing field visibility', () => {
        const a = makeSections()
        const b = makeSections({
            orderDetails: {
                fields: [{ id: 'tags', visible: false }],
                sectionVisible: true,
            },
        })
        expect(sectionsEqual(a, b)).toBe(false)
    })

    it('returns false for differing field order', () => {
        const a = makeSections({
            shipping: {
                fields: [
                    { id: 'tracking_url', visible: true },
                    { id: 'tracking_number', visible: true },
                ],
                sectionVisible: true,
            },
        })
        const b = makeSections({
            shipping: {
                fields: [
                    { id: 'tracking_number', visible: true },
                    { id: 'tracking_url', visible: true },
                ],
                sectionVisible: true,
            },
        })
        expect(sectionsEqual(a, b)).toBe(false)
    })
})

describe('buildPreferencesFromStored', () => {
    it('returns stored section when present', () => {
        const stored = {
            orderDetails: {
                fields: [{ id: 'tags', visible: false }],
            },
        }
        const result = buildPreferencesFromStored(stored)
        expect(result.sections.orderDetails).toEqual(stored.orderDetails)
    })

    it('falls back to { fields: [] } for missing non-configurable sections', () => {
        const result = buildPreferencesFromStored({})
        expect(result.sections.lineItems).toEqual({ fields: [] })
        expect(result.sections.shippingAddress).toEqual({ fields: [] })
        expect(result.sections.billingAddress).toEqual({ fields: [] })
    })

    it('falls back to all fields visible for missing configurable sections', () => {
        const result = buildPreferencesFromStored({})
        const orderDetailsFields = result.sections.orderDetails!.fields
        expect(orderDetailsFields.length).toBeGreaterThan(0)
        expect(orderDetailsFields.every((f) => f.visible)).toBe(true)

        const shippingFields = result.sections.shipping!.fields
        expect(shippingFields.length).toBeGreaterThan(0)
        expect(shippingFields.every((f) => f.visible)).toBe(true)
    })

    it('returns all 5 section keys regardless of input', () => {
        const result = buildPreferencesFromStored({
            orderDetails: { fields: [{ id: 'tags', visible: true }] },
        })
        const keys = Object.keys(result.sections)
        expect(keys).toHaveLength(5)
        expect(keys).toEqual(
            expect.arrayContaining([
                'orderDetails',
                'lineItems',
                'shipping',
                'shippingAddress',
                'billingAddress',
            ]),
        )
    })

    it('is equivalent to buildDefaultPreferences when stored is empty', () => {
        const fromStored = buildPreferencesFromStored({})
        const defaults = buildDefaultPreferences()
        expect(fromStored).toEqual(defaults)
    })
})

describe('buildOptimisticWidgetListUpdate', () => {
    const updatedTemplate: WidgetTemplate = {
        type: 'wrapper',
        widgets: [{ path: 'order', type: 'order' }],
    }

    it('returns undefined when old is undefined', () => {
        expect(
            buildOptimisticWidgetListUpdate(undefined, 1, updatedTemplate),
        ).toBeUndefined()
    })

    it('returns old unchanged when old.data.data is missing', () => {
        const old = { data: {} } as { data: { data: Widget[] } }
        expect(buildOptimisticWidgetListUpdate(old, 1, updatedTemplate)).toBe(
            old,
        )
    })

    it('updates the template of the matching widget by ID', () => {
        const old = {
            data: {
                data: [
                    { id: 1, type: 'shopify', template: { type: 'old' } },
                ] as unknown as Widget[],
            },
        }
        const result = buildOptimisticWidgetListUpdate(old, 1, updatedTemplate)
        expect((result!.data.data[0] as any).template).toEqual(updatedTemplate)
    })

    it('does not modify non-matching widgets', () => {
        const otherWidget = {
            id: 2,
            type: 'other',
            template: { type: 'other' },
        }
        const old = {
            data: {
                data: [
                    { id: 1, type: 'shopify', template: { type: 'old' } },
                    otherWidget,
                ] as unknown as Widget[],
            },
        }
        const result = buildOptimisticWidgetListUpdate(old, 1, updatedTemplate)
        expect(result!.data.data[1]).toEqual(otherWidget)
    })

    it('preserves other properties on the widget and outer structure', () => {
        const old = {
            data: {
                data: [
                    {
                        id: 1,
                        type: 'shopify',
                        context: 'ticket',
                        template: { type: 'old' },
                    },
                ] as unknown as Widget[],
                meta: { total: 1 },
            },
        }
        const result = buildOptimisticWidgetListUpdate(old, 1, updatedTemplate)
        expect((result!.data.data[0] as any).context).toBe('ticket')
        expect((result!.data as any).meta).toEqual({ total: 1 })
    })
})

describe('buildCreateWidgetPayload', () => {
    const sections: OrderFieldPreferences['sections'] = {
        orderDetails: { fields: [{ id: 'tags', visible: true }] },
    }

    it('returns correct shape', () => {
        const payload = buildCreateWidgetPayload(sections)
        expect(payload.integration_id).toBeNull()
        expect(payload.context).toBe('ticket')
        expect(payload.type).toBe('shopify')
    })

    it('template contains the order widget from buildInitialTemplate', () => {
        const payload = buildCreateWidgetPayload(sections)
        const expected = buildInitialTemplate(sections)
        expect(payload.template).toEqual(expected)
    })
})
