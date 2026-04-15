import { DateFormatType, TimeFormatType } from '@repo/utils'

import {
    getFulfillmentValue,
    getShippingLineCost,
    SHIPPING_FIELD_DEFINITIONS,
} from '../../fieldDefinitions/orderShippingFields'
import type { OrderFieldRenderContext } from '../../types'

const baseContext: OrderFieldRenderContext = {
    order: { id: 1 },
    isDraftOrder: undefined,
    integrationId: undefined,
    ticketId: undefined,
    storeName: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
    timezone: undefined,
}

describe('getFulfillmentValue', () => {
    it.each(['tracking_url', 'tracking_number'] as const)(
        'returns %s at index 0 when shippingEntryIndex is undefined',
        (key) => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                order: { id: 1, fulfillments: [{ [key]: 'val-0' }] },
            }
            expect(getFulfillmentValue(ctx, key)).toBe('val-0')
        },
    )

    it.each(['tracking_url', 'tracking_number'] as const)(
        'returns %s from the given shippingEntryIndex',
        (key) => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                shippingEntryIndex: 1,
                order: {
                    id: 1,
                    fulfillments: [{ [key]: 'val-0' }, { [key]: 'val-1' }],
                },
            }
            expect(getFulfillmentValue(ctx, key)).toBe('val-1')
        },
    )

    it.each(['tracking_url', 'tracking_number'] as const)(
        'returns undefined for %s when index is out of bounds',
        (key) => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                shippingEntryIndex: 5,
                order: { id: 1, fulfillments: [{ [key]: 'val-0' }] },
            }
            expect(getFulfillmentValue(ctx, key)).toBeUndefined()
        },
    )

    it.each([null, undefined])(
        'returns undefined when fulfillments is %s',
        (fulfillments) => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                order: {
                    id: 1,
                    fulfillments: fulfillments as null | undefined,
                },
            }
            expect(getFulfillmentValue(ctx, 'tracking_url')).toBeUndefined()
            expect(getFulfillmentValue(ctx, 'tracking_number')).toBeUndefined()
        },
    )

    it('returns undefined when fulfillment exists but key is missing', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, fulfillments: [{}] },
        }
        expect(getFulfillmentValue(ctx, 'tracking_url')).toBeUndefined()
        expect(getFulfillmentValue(ctx, 'tracking_number')).toBeUndefined()
    })
})

describe('getShippingLineCost', () => {
    it('returns price at index 0 when shippingEntryIndex is undefined', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, shipping_lines: [{ price: '10.00' }] },
        }
        expect(getShippingLineCost(ctx)).toBe('10.00')
    })

    it('reads from the given shippingEntryIndex', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            shippingEntryIndex: 1,
            order: {
                id: 1,
                shipping_lines: [{ price: '10.00' }, { price: '20.00' }],
            },
        }
        expect(getShippingLineCost(ctx)).toBe('20.00')
    })

    it('returns undefined when index is out of bounds', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            shippingEntryIndex: 5,
            order: { id: 1, shipping_lines: [{ price: '10.00' }] },
        }
        expect(getShippingLineCost(ctx)).toBeUndefined()
    })

    it('prefers price_set.shop_money.amount over price', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: {
                id: 1,
                shipping_lines: [
                    {
                        price: '10.00',
                        price_set: {
                            shop_money: {
                                amount: '15.00',
                                currency_code: 'USD',
                            },
                        },
                    },
                ],
            },
        }
        expect(getShippingLineCost(ctx)).toBe('15.00')
    })

    it('falls back to price when price_set is undefined', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, shipping_lines: [{ price: '10.00' }] },
        }
        expect(getShippingLineCost(ctx)).toBe('10.00')
    })

    it('falls back to price when price_set.shop_money is undefined', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: {
                id: 1,
                shipping_lines: [{ price: '10.00', price_set: {} }],
            },
        }
        expect(getShippingLineCost(ctx)).toBe('10.00')
    })

    it.each([null, undefined])(
        'returns undefined when shipping_lines is %s',
        (shippingLines) => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                order: {
                    id: 1,
                    shipping_lines: shippingLines as null | undefined,
                },
            }
            expect(getShippingLineCost(ctx)).toBeUndefined()
        },
    )

    it('returns undefined when shipping line has neither price_set nor price', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, shipping_lines: [{}] },
        }
        expect(getShippingLineCost(ctx)).toBeUndefined()
    })
})

describe('SHIPPING_FIELD_DEFINITIONS', () => {
    describe.each([
        {
            fieldId: 'tracking_url',
            orderData: {
                fulfillments: [
                    { tracking_url: 'https://track.example.com/0' },
                    { tracking_url: 'https://track.example.com/1' },
                ],
            },
            expectedAtIndex0: 'https://track.example.com/0',
            expectedAtIndex1: 'https://track.example.com/1',
        },
        {
            fieldId: 'tracking_number',
            orderData: {
                fulfillments: [
                    { tracking_number: 'TBA123' },
                    { tracking_number: 'TBA456' },
                ],
            },
            expectedAtIndex0: 'TBA123',
            expectedAtIndex1: 'TBA456',
        },
        {
            fieldId: 'shipping_cost',
            orderData: {
                shipping_lines: [{ price: '10.00' }, { price: '20.00' }],
            },
            expectedAtIndex0: '10.00',
            expectedAtIndex1: '20.00',
        },
        {
            fieldId: 'code',
            orderData: {
                shipping_lines: [{ code: 'STANDARD' }, { code: 'EXPRESS' }],
            },
            expectedAtIndex0: 'STANDARD',
            expectedAtIndex1: 'EXPRESS',
        },
    ])(
        '$fieldId',
        ({ fieldId, orderData, expectedAtIndex0, expectedAtIndex1 }) => {
            const field = SHIPPING_FIELD_DEFINITIONS[fieldId]

            it('defaults to index 0 when shippingEntryIndex is undefined', () => {
                const ctx: OrderFieldRenderContext = {
                    ...baseContext,
                    order: { id: 1, ...orderData },
                }
                expect(field.getValue(ctx)).toBe(expectedAtIndex0)
            })

            it('reads from the given shippingEntryIndex', () => {
                const ctx: OrderFieldRenderContext = {
                    ...baseContext,
                    shippingEntryIndex: 1,
                    order: { id: 1, ...orderData },
                }
                expect(field.getValue(ctx)).toBe(expectedAtIndex1)
            })
        },
    )

    describe('code getValue', () => {
        const field = SHIPPING_FIELD_DEFINITIONS.code

        it('returns undefined when shipping line has no code', () => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                order: { id: 1, shipping_lines: [{ price: '5.00' }] },
            }
            expect(field.getValue(ctx)).toBeUndefined()
        })
    })

    describe('shipping_cost formatValue', () => {
        const field = SHIPPING_FIELD_DEFINITIONS.shipping_cost

        it.each([undefined, null])('returns "-" when value is %s', (value) => {
            expect(
                field.formatValue!(value as unknown as undefined, baseContext),
            ).toBe('-')
        })

        it('prepends currency symbol when currency is present', () => {
            const ctx: OrderFieldRenderContext = {
                ...baseContext,
                order: { id: 1, currency: 'USD' },
            }
            expect(field.formatValue!('15.00', ctx)).toBe('$15.00')
        })

        it('returns value without symbol when currency is absent', () => {
            expect(field.formatValue!('15.00', baseContext)).toBe('15.00')
        })
    })
})
