import { useCallback } from 'react'

import { AccordionValues } from 'components/Accordion/utils/types'
import useLocalStorage from 'hooks/useLocalStorage'

import { StatsNavbarViewSections } from './constants'

export const useStatsNavbarSections = () => {
    const [sections, setSections] = useLocalStorage<AccordionValues>(
        'stats-navbar-sections',
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
