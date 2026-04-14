import { useShallow } from 'zustand/react/shallow'

import { useVersionHistoryBase } from '../../shared/useVersionHistoryBase'
import type { VersionHistoryData } from '../../shared/useVersionHistoryBase'
import { useSkillEditorStore } from '../context/KnowledgeEditorSkillContext'
import { useSkillSwitchVersion } from './useSkillSwitchVersion'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useSkillVersionHistory(): VersionHistoryData {
    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const {
        shopName,
        helpCenterId,
        helpCenterLocale,
        skillId,
        publishedVersionId,
        draftVersionId,
        skillIsCurrent,
        historicalVersion,
        isUpdating,
        isAutoSaving,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            shopName: storeState.config.shopName,
            helpCenterId: storeState.config.helpCenter.id,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
            skillId: storeState.state.skill?.id ?? 0,
            publishedVersionId: storeState.state.skill?.publishedVersionId,
            draftVersionId: storeState.state.skill?.draftVersionId,
            skillIsCurrent: storeState.state.skill?.isCurrent,
            historicalVersion: storeState.state.historicalVersion,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
    )

    const isViewingHistoricalVersion =
        historicalVersion !== null &&
        historicalVersion.publishedDatetime !== null

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : skillIsCurrent === undefined
          ? false
          : !skillIsCurrent

    const { switchToVersion } = useSkillSwitchVersion()

    return useVersionHistoryBase({
        shopName,
        resourceType: 'guidance',
        helpCenterId,
        articleId: skillId,
        locale: helpCenterLocale,
        currentVersionId: publishedVersionId ?? null,
        draftVersionId: draftVersionId ?? null,
        isViewingDraft,
        historicalVersion,
        isUpdating,
        isAutoSaving,
        dispatch,
        switchToVersion,
    })
}
