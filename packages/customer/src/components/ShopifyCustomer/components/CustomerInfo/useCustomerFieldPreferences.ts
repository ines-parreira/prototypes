import { useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { DEFAULT_FIELDS, FIELD_DEFINITIONS } from './fields'
import type { ShopifyFieldPreferences } from './types'

const STORAGE_KEY = 'shopify-customer-info-fields'

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)

const DEFAULT_VISIBLE = new Set<string>(DEFAULT_FIELDS.map((f) => f.id))

const defaultPreferences: ShopifyFieldPreferences = {
    fields: [
        ...DEFAULT_FIELDS,
        ...ALL_FIELD_IDS.filter((id) => !DEFAULT_VISIBLE.has(id)).map((id) => ({
            id,
            visible: false,
        })),
    ],
}

export function useCustomerFieldPreferences() {
    const [preferences, setPreferences] =
        useLocalStorage<ShopifyFieldPreferences>(
            STORAGE_KEY,
            defaultPreferences,
        )

    const fields = useMemo(() => {
        const fieldsList = Array.isArray(preferences?.fields)
            ? preferences.fields
            : defaultPreferences.fields

        return fieldsList
            .filter((f) => f.visible && FIELD_DEFINITIONS[f.id])
            .map((f) => FIELD_DEFINITIONS[f.id])
    }, [preferences])

    return { fields, preferences, setPreferences }
}
