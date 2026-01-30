import { useMemo } from 'react'

import { useGuidanceContext } from '../context'
import type { GuidanceModeType } from '../context/types'
import { useToggleVisibility } from '../context/useToggleVisibility'

export type GuidanceDetailsData = {
    aiAgentStatus: {
        value: boolean
        onChange: () => Promise<void>
        tooltip?: string
    }
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    isUpdating: boolean
    isDraft: boolean
    isViewingHistoricalVersion: boolean
    guidanceMode: GuidanceModeType
}

const getAiAgentStatusTooltip = (
    isDraft: boolean,
    isAtLimit: boolean,
    visibility: boolean,
    limitMessage: string,
    isViewingHistoricalVersion: boolean,
): string | undefined => {
    if (isViewingHistoricalVersion) {
        return 'Restore this version to be able to use it.'
    }
    if (isDraft) {
        return 'Only published versions can be enabled for AI Agent. Publish this version to enable it for AI Agent.'
    }
    if (isAtLimit && !visibility) {
        return limitMessage
    }
    return undefined
}

export const useGuidanceDetailsFromContext = (): GuidanceDetailsData => {
    const { state, guidanceArticle } = useGuidanceContext()
    const { toggleVisibility, isAtLimit, limitMessage } = useToggleVisibility()

    const isDisabled = state.isUpdating || state.isAutoSaving
    const isDraft =
        state.guidance?.isCurrent === undefined
            ? false
            : !state.guidance?.isCurrent
    const isViewingHistoricalVersion = state.historicalVersion !== null

    return useMemo(
        () => ({
            aiAgentStatus: {
                value:
                    isDraft || isViewingHistoricalVersion
                        ? false
                        : state.visibility,
                onChange: toggleVisibility,
                tooltip: getAiAgentStatusTooltip(
                    isDraft,
                    isAtLimit,
                    state.visibility,
                    limitMessage,
                    isViewingHistoricalVersion,
                ),
            },
            createdDatetime: guidanceArticle
                ? new Date(guidanceArticle.createdDatetime)
                : undefined,
            lastUpdatedDatetime: guidanceArticle
                ? new Date(guidanceArticle.lastUpdated)
                : undefined,
            isUpdating:
                isDisabled ||
                isDraft ||
                isViewingHistoricalVersion ||
                (isAtLimit && !state.visibility),
            isDraft,
            isViewingHistoricalVersion,
            guidanceMode: state.guidanceMode,
        }),
        [
            state.visibility,
            guidanceArticle,
            toggleVisibility,
            isAtLimit,
            limitMessage,
            isDraft,
            isDisabled,
            isViewingHistoricalVersion,
            state.guidanceMode,
        ],
    )
}
