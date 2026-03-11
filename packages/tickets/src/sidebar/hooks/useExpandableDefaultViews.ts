import { useState } from 'react'

import { useDefaultViews } from './useDefaultViews'

const COLLAPSED_VIEW_COUNT = 3

export function useExpandableDefaultViews() {
    const { visibleSystemViews } = useDefaultViews()
    const [isExpanded, setIsExpanded] = useState(false)

    const displayedViews = isExpanded
        ? visibleSystemViews
        : visibleSystemViews.slice(0, COLLAPSED_VIEW_COUNT)
    const showToggle = visibleSystemViews.length > COLLAPSED_VIEW_COUNT

    return {
        displayedViews,
        showToggle,
        isExpanded,
        toggleExpanded: () => setIsExpanded((prev) => !prev),
    }
}
