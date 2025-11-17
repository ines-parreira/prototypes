import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { AccordionValues } from 'components/Accordion/utils/types'
import {
    STATS_NAVBAR_SECTIONS_KEY,
    StatsNavbarViewSections,
} from 'domains/reporting/pages/common/components/StatsNavbarView/constants'

export const useStatsNavbarSections = () => {
    const [sections, setSections] = useLocalStorage<AccordionValues>(
        STATS_NAVBAR_SECTIONS_KEY,
        Object.values(StatsNavbarViewSections),
    )

    const handleNavigationStateChange = useCallback(
        (navigationValues: AccordionValues) => {
            setSections(navigationValues)
        },
        [setSections],
    )

    return {
        sections,
        handleNavigationStateChange,
    }
}
