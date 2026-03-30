import { useMemo } from 'react'

import {
    deriveCustomerFields,
    deriveSections,
} from './customerFieldPreferences.utils'
import type { SectionFieldData } from './customerFieldPreferences.utils'
import { useWidgetFieldPreferences } from './useWidgetFieldPreferences'

export type { SectionFieldData }

export function useCustomerFieldPreferences() {
    const { preferences, savePreferences, isLoading } =
        useWidgetFieldPreferences()

    const customerFields = useMemo(
        () => deriveCustomerFields(preferences),
        [preferences],
    )

    const sections = useMemo(() => deriveSections(preferences), [preferences])

    return { customerFields, sections, preferences, savePreferences, isLoading }
}
