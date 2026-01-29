import {
    useVersionHistoryBase,
    type VersionHistoryData,
} from '../../shared/useVersionHistoryBase'
import { useArticleContext } from '../context'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useVersionHistory(): VersionHistoryData {
    const { state, dispatch, config } = useArticleContext()

    const { helpCenter } = config

    return useVersionHistoryBase({
        helpCenterId: helpCenter?.id ?? 0,
        articleId: state.article?.id ?? 0,
        locale: state.currentLocale,
        currentVersionId:
            state.article?.translation.published_version_id ?? null,
        historicalVersion: state.historicalVersion,
        isUpdating: state.isUpdating,
        isAutoSaving: state.isAutoSaving,
        dispatch,
    })
}
