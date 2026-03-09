import { useMemo } from 'react'

import { FIELD_DEFINITIONS } from './fields'
import { useWidgetFieldPreferences } from './useWidgetFieldPreferences'

export function useCustomerFieldPreferences() {
    const { preferences, savePreferences, isLoading } =
        useWidgetFieldPreferences()

    const fields = useMemo(() => {
        const fieldsList = Array.isArray(preferences?.fields)
            ? preferences.fields
            : []

        return fieldsList
            .filter((f) => f.visible && FIELD_DEFINITIONS[f.id])
            .map((f) => FIELD_DEFINITIONS[f.id])
    }, [preferences])

    return { fields, preferences, savePreferences, isLoading }
}
