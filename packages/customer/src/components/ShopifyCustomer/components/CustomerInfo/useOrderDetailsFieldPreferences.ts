import { useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { DEFAULT_FIELDS, FIELD_DEFINITIONS } from './orderDetailsFields'
import type { OrderDetailsFieldPreferences } from './types'

const STORAGE_KEY = 'orderDetailsFieldPreferences'

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)

const DEFAULT_VISIBLE = new Set<string>(DEFAULT_FIELDS.map((f) => f.id))

const defaultPreferences: OrderDetailsFieldPreferences = {
    fields: [
        ...DEFAULT_FIELDS,
        ...ALL_FIELD_IDS.filter((id) => !DEFAULT_VISIBLE.has(id)).map((id) => ({
            id,
            visible: false,
        })),
    ],
}

export function useOrderDetailsFieldPreferences() {
    const [preferences, setPreferences] =
        useLocalStorage<OrderDetailsFieldPreferences>(
            STORAGE_KEY,
            defaultPreferences,
        )

    const fields = useMemo(
        () =>
            preferences.fields
                .filter((f) => f.visible && FIELD_DEFINITIONS[f.id])
                .map((f) => FIELD_DEFINITIONS[f.id]),
        [preferences],
    )

    return { fields, preferences, setPreferences }
}
