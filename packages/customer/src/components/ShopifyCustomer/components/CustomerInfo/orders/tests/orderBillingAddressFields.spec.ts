import { DateFormatType, TimeFormatType } from '@repo/utils'

import { createOrderAddressFields } from '../../fieldDefinitions/createOrderAddressFields'
import type { OrderFieldRenderContext } from '../../types'

const BILLING_ADDRESS_FIELD_DEFINITIONS =
    createOrderAddressFields('billing_address')

const baseContext: OrderFieldRenderContext = {
    order: { id: 1 },
    isDraftOrder: undefined,
    integrationId: undefined,
    ticketId: undefined,
    storeName: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
}

const allFields = [
    'name',
    'address1',
    'address2',
    'city',
    'country',
    'province',
    'province_code',
    'zip',
]

const nullableFields = [
    'address1',
    'address2',
    'city',
    'country',
    'province',
    'province_code',
    'zip',
]

describe.each(allFields)('%s', (fieldId) => {
    const field = BILLING_ADDRESS_FIELD_DEFINITIONS[fieldId]

    it('returns value when present', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: {
                id: 1,
                billing_address: {
                    name: 'John Doe',
                    address1: '123 Main St',
                    address2: 'Apt 4',
                    city: 'New York',
                    country: 'US',
                    province: 'New York',
                    province_code: 'NY',
                    zip: '10001',
                },
            },
        }
        expect(field.getValue(ctx)).toBeDefined()
    })

    it('returns undefined when billing_address is undefined', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, billing_address: undefined },
        }
        expect(field.getValue(ctx)).toBeUndefined()
    })

    it('returns undefined when billing_address is null', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: { id: 1, billing_address: null },
        }
        expect(field.getValue(ctx)).toBeUndefined()
    })
})

describe.each(nullableFields)('%s', (fieldId) => {
    const field = BILLING_ADDRESS_FIELD_DEFINITIONS[fieldId]

    it('returns undefined when property is null', () => {
        const ctx: OrderFieldRenderContext = {
            ...baseContext,
            order: {
                id: 1,
                billing_address: {
                    [fieldId]: null,
                },
            },
        }
        expect(field.getValue(ctx)).toBeUndefined()
    })
})
