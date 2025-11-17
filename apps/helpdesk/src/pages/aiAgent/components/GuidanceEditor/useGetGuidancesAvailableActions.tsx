import { useMemo } from 'react'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

export const useGetGuidancesAvailableActions = (
    shopName: string,
    shopType: string,
) => {
    const { data: actions = [], isLoading } =
        useGetStoreWorkflowsConfigurations({
            storeName: shopName,
            storeType: shopType,
            triggers: ['llm-prompt'],
            enabled: true,
        })

    const guidanceActions: GuidanceAction[] = useMemo(() => {
        return actions.map((action) => {
            return {
                name: action.name,
                value: action.id,
            }
        })
    }, [actions])

    return {
        isLoading,
        guidanceActions,
    }
}
