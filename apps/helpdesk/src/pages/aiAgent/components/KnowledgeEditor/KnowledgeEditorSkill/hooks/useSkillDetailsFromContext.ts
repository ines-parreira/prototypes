import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { TransformedArticle } from 'pages/aiAgent/skills/types'

import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import type { SkillModeType } from '../context/types'

export type SkillDetailsData = {
    status: TransformedArticle['status']
    isDraft: boolean
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    mode: SkillModeType
}

export const useSkillDetailsFromContext = (): SkillDetailsData => {
    const { visibility, mode, createdDatetime, lastUpdated, isCurrent } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                visibility: storeState.skill?.visibility,
                mode: storeState.state.mode,
                createdDatetime: storeState.skill?.createdDatetime,
                lastUpdated: storeState.skill?.lastUpdated,
                isCurrent: storeState.skill?.isCurrent,
            })),
        )
    const isDraft = isCurrent === undefined ? false : !isCurrent

    return useMemo(
        () => ({
            status:
                visibility === VisibilityStatusEnum.PUBLIC
                    ? 'enabled'
                    : 'disabled',
            isDraft,
            createdDatetime: createdDatetime
                ? new Date(createdDatetime)
                : undefined,
            lastUpdatedDatetime: lastUpdated
                ? new Date(lastUpdated)
                : undefined,
            mode,
        }),
        [visibility, isDraft, createdDatetime, lastUpdated, mode],
    )
}
