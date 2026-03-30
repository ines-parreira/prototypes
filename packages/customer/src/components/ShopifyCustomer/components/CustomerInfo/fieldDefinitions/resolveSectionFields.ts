import type { ShopperAddress } from '../../../types'
import type { FieldConfig } from '../types'
import type { SectionFieldData } from '../widget/customerFieldPreferences.utils'
import { createAddressFieldDefinitions } from './addressFieldDefinitions'

export type ResolvedSection = {
    key: string
    label: string
    fields: FieldConfig[]
}

export function resolveSectionFields(
    section: SectionFieldData,
    addresses: ShopperAddress[],
): ResolvedSection[] {
    if (section.key === 'addresses') {
        return addresses.map((_, index) => {
            const fieldDefs = createAddressFieldDefinitions(index)
            const fields = section.fields
                .map((f) => fieldDefs[f.id])
                .filter(Boolean)
            return {
                key: `address-${index}`,
                label: 'Address',
                fields,
            }
        })
    }
    return [
        {
            key: section.key,
            label: section.label,
            fields: section.fields,
        },
    ]
}
