import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { AccordionValues } from 'components/Accordion/utils/types'
import type { ViewCategoryNavbar } from 'models/view/types'

import { ViewCategories } from './constants'

export function useStoredNavigationSections(categories: ViewCategoryNavbar[]) {
    const viewCategories = useMemo(
        () =>
            categories.map(
                (category) => ViewCategories[category],
            ) as AccordionValues,
        [categories],
    )

    const [collapsedFirstLevelView, setCollapsedFirstLevelView] =
        useLocalStorage<AccordionValues>(
            'collapsed-first-level-view',
            viewCategories,
        )
    const [collapsedSections, setCollapsedSections] =
        useLocalStorage<AccordionValues>('collapsed-view-sections', [])

    const handleNavigationStateChange = useCallback(
        (navigationValue: AccordionValues) => {
            const { firstLevelViews, sections } = navigationValue.reduce<{
                firstLevelViews: AccordionValues
                sections: AccordionValues
            }>(
                (acc, value) => {
                    if (viewCategories.includes(value)) {
                        acc.firstLevelViews.push(value)
                    } else {
                        acc.sections.push(value)
                    }
                    return acc
                },
                { firstLevelViews: [], sections: [] },
            )
            setCollapsedSections(sections)
            setCollapsedFirstLevelView(firstLevelViews)
        },
        [setCollapsedSections, setCollapsedFirstLevelView, viewCategories],
    )

    const navigationValues = useMemo(
        () =>
            Array.from(
                new Set([
                    ...collapsedSections.filter(Boolean),
                    ...collapsedFirstLevelView,
                ]),
            ),
        [collapsedSections, collapsedFirstLevelView],
    )

    return {
        handleNavigationStateChange,
        navigationValues,
    }
}
