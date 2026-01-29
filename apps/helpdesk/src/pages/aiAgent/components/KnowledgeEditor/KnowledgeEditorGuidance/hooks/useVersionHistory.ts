import { useVersionHistoryBase } from '../../shared/useVersionHistoryBase'
import type { VersionHistoryData } from '../../shared/useVersionHistoryBase'
import { useGuidanceContext } from '../context'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useVersionHistory(): VersionHistoryData {
    const { state, dispatch, config } = useGuidanceContext()

    const { guidanceHelpCenter } = config

    return useVersionHistoryBase({
        helpCenterId: guidanceHelpCenter?.id ?? 0,
        articleId: state.guidance?.id ?? 0,
        locale: guidanceHelpCenter?.default_locale ?? 'en-US',
        currentVersionId: state.guidance?.publishedVersionId ?? null,
        historicalVersion: state.historicalVersion,
        isUpdating: state.isUpdating,
        isAutoSaving: state.isAutoSaving,
        dispatch,
    })
}
