import { useShallow } from 'zustand/react/shallow'

import { useVersionHistoryBase } from '../../shared/useVersionHistoryBase'
import type { VersionHistoryData } from '../../shared/useVersionHistoryBase'
import { useGuidanceStore } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useVersionHistory(): VersionHistoryData {
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const {
        shopName,
        guidanceHelpCenterId,
        guidanceHelpCenterLocale,
        guidanceId,
        publishedVersionId,
        draftVersionId,
        guidanceIsCurrent,
        historicalVersion,
        isUpdating,
        isAutoSaving,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            shopName: storeState.config.shopName,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id ?? 0,
            guidanceHelpCenterLocale:
                storeState.config.guidanceHelpCenter?.default_locale ?? 'en-US',
            guidanceId: storeState.state.guidance?.id ?? 0,
            publishedVersionId: storeState.state.guidance?.publishedVersionId,
            draftVersionId: storeState.state.guidance?.draftVersionId,
            guidanceIsCurrent: storeState.state.guidance?.isCurrent,
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
        : guidanceIsCurrent === undefined
          ? false
          : !guidanceIsCurrent

    const { switchToVersion } = useSwitchVersion()

    return useVersionHistoryBase({
        shopName,
        resourceType: 'guidance',
        helpCenterId: guidanceHelpCenterId,
        articleId: guidanceId,
        locale: guidanceHelpCenterLocale,
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
