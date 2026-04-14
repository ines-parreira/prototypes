import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { TransformedArticle } from 'pages/aiAgent/skills/types'

import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import type { SkillModeType } from '../context/types'

export type SkillDetailsData = {
    status: TransformedArticle['status']
    isDraft: boolean
    isViewingHistoricalVersion: boolean
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    mode: SkillModeType
}

export const useSkillDetailsFromContext = (): SkillDetailsData => {
    const {
        visibility,
        mode,
        createdDatetime,
        lastUpdated,
        isCurrent,
        historicalPublishedDatetime,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            visibility: storeState.state.skill?.visibility,
            mode: storeState.state.mode,
            createdDatetime: storeState.state.skill?.createdDatetime,
            lastUpdated: storeState.state.skill?.lastUpdated,
            isCurrent: storeState.state.skill?.isCurrent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )
    const isDraft = isCurrent === undefined ? false : !isCurrent
    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

    return useMemo(
        () => ({
            status:
                visibility === VisibilityStatusEnum.PUBLIC
                    ? 'enabled'
                    : 'disabled',
            isDraft,
            isViewingHistoricalVersion,
            createdDatetime: createdDatetime
                ? new Date(createdDatetime)
                : undefined,
            lastUpdatedDatetime: lastUpdated
                ? new Date(lastUpdated)
                : undefined,
            mode,
        }),
        [
            visibility,
            isDraft,
            isViewingHistoricalVersion,
            createdDatetime,
            lastUpdated,
            mode,
        ],
    )
}
