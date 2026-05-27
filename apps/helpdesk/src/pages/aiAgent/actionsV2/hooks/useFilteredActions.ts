import { useMemo } from 'react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

export const useFilteredActions = (
    actions: StoreWorkflowsConfiguration[],
    searchTerm: string,
): StoreWorkflowsConfiguration[] => {
    return useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) {
            return actions
        }
        return actions.filter((action) =>
            action.name.toLowerCase().includes(term),
        )
    }, [actions, searchTerm])
}
