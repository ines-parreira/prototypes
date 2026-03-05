import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceStore } from '../context'
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
    visibilityConflict: {
        isOpen: boolean
        message: string
    }
    closeVisibilityConflictModal: () => void
    rebaseAndEnableVisibility: () => Promise<void>
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
        return 'Publish your draft edits in order to enable this version for AI Agent'
    }
    if (isAtLimit && !visibility) {
        return limitMessage
    }
    return undefined
}

export const useGuidanceDetailsFromContext = (): GuidanceDetailsData => {
    const {
        visibility,
        isUpdating,
        isAutoSaving,
        isGuidanceCurrent,
        historicalPublishedDatetime,
        guidanceMode,
        createdDatetime,
        lastUpdated,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            visibility: storeState.state.visibility,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            isGuidanceCurrent: storeState.state.guidance?.isCurrent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            guidanceMode: storeState.state.guidanceMode,
            createdDatetime: storeState.guidanceArticle?.createdDatetime,
            lastUpdated: storeState.guidanceArticle?.lastUpdated,
        })),
    )
    const {
        toggleVisibility,
        isAtLimit,
        limitMessage,
        visibilityConflict,
        closeVisibilityConflictModal,
        rebaseAndEnableVisibility,
    } = useToggleVisibility()

    const isDisabled = isUpdating || isAutoSaving
    const isDraft = isGuidanceCurrent === undefined ? false : !isGuidanceCurrent
    // Consider it a historical version if historicalVersion exists with a published date
    // (not when comparing draft to published, which has publishedDatetime = null)
    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

    return useMemo(
        () => ({
            aiAgentStatus: {
                value:
                    isDraft || isViewingHistoricalVersion ? false : visibility,
                onChange: toggleVisibility,
                tooltip: getAiAgentStatusTooltip(
                    isDraft,
                    isAtLimit,
                    visibility,
                    limitMessage,
                    isViewingHistoricalVersion,
                ),
            },
            createdDatetime: createdDatetime
                ? new Date(createdDatetime)
                : undefined,
            lastUpdatedDatetime: lastUpdated
                ? new Date(lastUpdated)
                : undefined,
            isUpdating:
                isDisabled ||
                isDraft ||
                isViewingHistoricalVersion ||
                (isAtLimit && !visibility),
            isDraft,
            isViewingHistoricalVersion,
            guidanceMode,
            visibilityConflict: {
                isOpen: visibilityConflict.isOpen,
                message: visibilityConflict.message,
            },
            closeVisibilityConflictModal,
            rebaseAndEnableVisibility,
        }),
        [
            visibility,
            createdDatetime,
            lastUpdated,
            toggleVisibility,
            isAtLimit,
            limitMessage,
            isDraft,
            isDisabled,
            isViewingHistoricalVersion,
            guidanceMode,
            visibilityConflict.isOpen,
            visibilityConflict.message,
            closeVisibilityConflictModal,
            rebaseAndEnableVisibility,
        ],
    )
}
