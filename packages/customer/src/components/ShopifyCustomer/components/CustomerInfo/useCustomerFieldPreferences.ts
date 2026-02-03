import { useLocalStorage } from '@repo/hooks'

import { DEFAULT_FIELD_IDS, FIELD_DEFINITIONS } from './defaultFields'

const STORAGE_KEY = 'customerInfoFieldPreferences'

export function useCustomerFieldPreferences() {
    const [fieldIds, setFieldIds, resetFieldIds] = useLocalStorage<string[]>(
        STORAGE_KEY,
        [...DEFAULT_FIELD_IDS],
    )

    const fields = fieldIds.map((id) => FIELD_DEFINITIONS[id]).filter(Boolean)

    return { fields, setFieldIds, resetFieldIds }
}
