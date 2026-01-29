import { VersionBanner } from '../shared/VersionBanner'
import { useArticleContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

export function ArticleVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } = useVersionHistory()
    const { state, dispatch } = useArticleContext()

    return (
        <VersionBanner
            isViewingDraft={isViewingDraft}
            hasDraftVersion={hasDraftVersion}
            hasPublishedVersion={hasPublishedVersion}
            isDisabled={isDisabled}
            switchVersion={switchVersion}
            isViewingHistoricalVersion={isViewingHistoricalVersion}
            onGoToLatest={onGoToLatest}
            historicalVersion={state.historicalVersion}
            onOpenRestoreModal={() =>
                dispatch({ type: 'SET_MODAL', payload: 'restore' })
            }
        />
    )
}
