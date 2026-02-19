import { useVersionHistoryBase } from '../../shared/useVersionHistoryBase'
import type { VersionHistoryData } from '../../shared/useVersionHistoryBase'
import { useGuidanceContext } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useVersionHistory(): VersionHistoryData {
    const { state, dispatch, config } = useGuidanceContext()

    const { guidanceHelpCenter } = config

    const isViewingHistoricalVersion =
        state.historicalVersion !== null &&
        state.historicalVersion.publishedDatetime !== null

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : state.guidance?.isCurrent === undefined
          ? false
          : !state.guidance?.isCurrent

    const { switchToVersion } = useSwitchVersion()

    return useVersionHistoryBase({
        shopName: config.shopName,
        resourceType: 'guidance',
        helpCenterId: guidanceHelpCenter?.id ?? 0,
        articleId: state.guidance?.id ?? 0,
        locale: guidanceHelpCenter?.default_locale ?? 'en-US',
        currentVersionId: state.guidance?.publishedVersionId ?? null,
        draftVersionId: state.guidance?.draftVersionId ?? null,
        isViewingDraft,
        historicalVersion: state.historicalVersion,
        isUpdating: state.isUpdating,
        isAutoSaving: state.isAutoSaving,
        dispatch,
        switchToVersion,
    })
}
