import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import { useGuidanceStore } from '../KnowledgeEditorGuidance/context'

export const useHasDisabledActionsInContent = (): boolean => {
    const { content, shopName, shopType } = useGuidanceStore(
        useShallow((storeState) => ({
            content: storeState.state.content,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
        })),
    )

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
        return guidanceActions.some(
            (action) =>
                isActionSetupRequired(action) && mentionedIds.has(action.value),
        )
    }, [content, guidanceActions])
}
