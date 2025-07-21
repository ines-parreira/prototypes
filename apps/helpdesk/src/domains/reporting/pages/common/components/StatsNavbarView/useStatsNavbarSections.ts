import { useCallback } from 'react'

import { AccordionValues } from 'components/Accordion/utils/types'
import {
    STATS_NAVBAR_SECTIONS_KEY,
    StatsNavbarViewSections,
} from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import useLocalStorage from 'hooks/useLocalStorage'

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
