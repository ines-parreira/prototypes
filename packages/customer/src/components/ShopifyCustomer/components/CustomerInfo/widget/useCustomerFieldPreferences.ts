import { useMemo } from 'react'

import { FIELD_DEFINITIONS } from '../fieldDefinitions/fields'
import { SECTION_CONFIGS } from '../fieldDefinitions/sectionConfig'
import type { FieldConfig, SectionKey } from '../types'
import { useWidgetFieldPreferences } from './useWidgetFieldPreferences'

export type SectionFieldData = {
    key: SectionKey
    label: string
    fields: FieldConfig[]
}

export function useCustomerFieldPreferences() {
    const { preferences, savePreferences, isLoading } =
        useWidgetFieldPreferences()

    const customerFields = useMemo(() => {
        const fieldsList = Array.isArray(preferences?.fields)
            ? preferences.fields
            : []

        return fieldsList
            .filter((f) => f.visible && FIELD_DEFINITIONS[f.id])
            .map((f) => FIELD_DEFINITIONS[f.id])
    }, [preferences])

    const sections = useMemo(() => {
        const result: SectionFieldData[] = []

        for (const config of SECTION_CONFIGS) {
            if (config.key === 'customer') continue

            const sectionPrefs = preferences?.sections?.[config.key]?.fields
            if (!sectionPrefs) continue

            const visibleFields = sectionPrefs
                .filter((f) => f.visible && config.fieldDefinitions[f.id])
                .map((f) => config.fieldDefinitions[f.id])

            if (visibleFields.length > 0) {
                result.push({
                    key: config.key,
                    label: config.label,
                    fields: visibleFields,
                })
            }
        }

        return result
    }, [preferences])

    return { customerFields, sections, preferences, savePreferences, isLoading }
}
