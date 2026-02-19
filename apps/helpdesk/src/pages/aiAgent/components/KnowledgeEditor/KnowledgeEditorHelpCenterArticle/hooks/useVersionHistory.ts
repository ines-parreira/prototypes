import { useVersionHistoryBase } from '../../shared/useVersionHistoryBase'
import type { VersionHistoryData } from '../../shared/useVersionHistoryBase'
import { useArticleContext } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type { ArticleTranslationVersion } from '../../shared/useVersionHistoryBase'
export type { VersionHistoryData }

export function useVersionHistory(): VersionHistoryData {
    const { state, dispatch, config } = useArticleContext()

    const { helpCenter } = config

    const isViewingHistoricalVersion =
        state.historicalVersion != null &&
        state.historicalVersion.publishedDatetime != null

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : state.article?.translation.is_current === false

    const { switchToVersion } = useSwitchVersion()

    return useVersionHistoryBase({
        shopName: config.shopName ?? '',
        resourceType: 'article',
        helpCenterId: helpCenter?.id ?? 0,
        articleId: state.article?.id ?? 0,
        locale: state.currentLocale,
        currentVersionId:
            state.article?.translation.published_version_id ?? null,
        draftVersionId: state.article?.translation.draft_version_id ?? null,
        isViewingDraft,
        historicalVersion: state.historicalVersion,
        isUpdating: state.isUpdating,
        isAutoSaving: state.isAutoSaving,
        dispatch,
        switchToVersion,
    })
}
