import { useMemo } from 'react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

export const useActionsInContentNeedingSetup = (
    content: string,
    shopName: string,
    shopType: string,
): GuidanceAction[] => {
    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    return useMemo(() => {
        const mentionedIds = new Set(
            [
                ...content.matchAll(
                    new RegExp(guidanceActionRegex.source, 'g'),
                ),
            ].map(([, id]) => id),
        )
        return guidanceActions.filter(
            (action) =>
                isActionSetupRequired(action) && mentionedIds.has(action.value),
        )
    }, [content, guidanceActions])
}
