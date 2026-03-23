import { SECTION_CONFIGS } from '../fieldDefinitions/sectionConfig'
import type {
    FieldPreference,
    SectionKey,
    ShopifyFieldPreferences,
} from '../types'

export function initShopifySections(
    preferences: ShopifyFieldPreferences,
): Record<SectionKey, FieldPreference[]> {
    const sections = {} as Record<SectionKey, FieldPreference[]>
    for (const config of SECTION_CONFIGS) {
        const sectionPref = preferences.sections?.[config.key]
        if (sectionPref) {
            sections[config.key] = sectionPref.fields
        } else if (config.key === 'customer') {
            sections[config.key] = preferences.fields
        } else {
            sections[config.key] = Object.keys(config.fieldDefinitions).map(
                (id) => ({ id, visible: false }),
            )
        }
    }
    return sections
}

export function fieldsEqual(
    a: FieldPreference[],
    b: FieldPreference[],
): boolean {
    if (a.length !== b.length) return false
    return a.every((f, i) => f.id === b[i].id && f.visible === b[i].visible)
}

export function shopifySectionsEqual(
    a: Record<SectionKey, FieldPreference[]>,
    b: Record<SectionKey, FieldPreference[]>,
): boolean {
    for (const config of SECTION_CONFIGS) {
        if (!fieldsEqual(a[config.key], b[config.key])) return false
    }
    return true
}

export function reorderArray<T>(
    array: T[],
    fromIndex: number,
    toIndex: number,
): T[] {
    const result = [...array]
    const [item] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, item)
    return result
}
