import { describe, expect, it } from 'vitest'

import type { ShopperAddress } from '../../../../types'
import type { FieldConfig } from '../../types'
import type { SectionFieldData } from '../../widget/customerFieldPreferences.utils'
import { resolveSectionFields } from '../resolveSectionFields'

const makeField = (id: string): FieldConfig => ({
    id,
    type: 'readonly',
    label: id,
    getValue: () => undefined,
})

const makeAddress = (overrides: Partial<ShopperAddress> = {}): ShopperAddress =>
    ({
        id: 1,
        customer_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        address1: '123 Main St',
        address2: null,
        city: 'NYC',
        province: 'NY',
        country: 'US',
        zip: '10001',
        phone: null,
        name: 'John Doe',
        province_code: 'NY',
        country_code: 'US',
        country_name: 'United States',
        default: true,
        ...overrides,
    }) as ShopperAddress

describe('resolveSectionFields', () => {
    it('returns non-address section as-is', () => {
        const fields = [makeField('firstName'), makeField('email')]
        const section: SectionFieldData = {
            key: 'customer',
            label: 'Customer',
            fields,
        }

        const result = resolveSectionFields(section, [])

        expect(result).toEqual([{ key: 'customer', label: 'Customer', fields }])
    })

    it('returns empty array for addresses section with no addresses', () => {
        const section: SectionFieldData = {
            key: 'addresses',
            label: 'Addresses',
            fields: [makeField('city')],
        }

        const result = resolveSectionFields(section, [])

        expect(result).toEqual([])
    })

    it('returns one resolved section per address', () => {
        const section: SectionFieldData = {
            key: 'addresses',
            label: 'Addresses',
            fields: [makeField('city'), makeField('country')],
        }
        const addresses = [makeAddress(), makeAddress({ id: 2 })]

        const result = resolveSectionFields(section, addresses)

        expect(result).toHaveLength(2)
        expect(result[0].key).toBe('address-0')
        expect(result[0].label).toBe('Address')
        expect(result[0].fields).toHaveLength(2)
        expect(result[0].fields.map((f) => f.id)).toEqual(['city', 'country'])
        expect(result[1].key).toBe('address-1')
    })

    it('filters out fields that do not match address field definitions', () => {
        const section: SectionFieldData = {
            key: 'addresses',
            label: 'Addresses',
            fields: [makeField('city'), makeField('nonExistentField')],
        }

        const result = resolveSectionFields(section, [makeAddress()])

        expect(result).toHaveLength(1)
        expect(result[0].fields).toHaveLength(1)
        expect(result[0].fields[0].id).toBe('city')
    })

    it('returns empty fields when no field IDs match', () => {
        const section: SectionFieldData = {
            key: 'addresses',
            label: 'Addresses',
            fields: [makeField('bogus')],
        }

        const result = resolveSectionFields(section, [makeAddress()])

        expect(result).toHaveLength(1)
        expect(result[0].fields).toHaveLength(0)
    })
})
