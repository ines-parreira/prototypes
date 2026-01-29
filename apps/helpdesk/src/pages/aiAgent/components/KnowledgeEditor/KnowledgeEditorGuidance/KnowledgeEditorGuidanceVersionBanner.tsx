import { VersionBanner } from '../shared/VersionBanner'
import { useGuidanceContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

import css from './KnowledgeEditorGuidanceVersionBanner.less'

export function KnowledgeEditorGuidanceVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } = useVersionHistory()
    const { state, dispatch } = useGuidanceContext()

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
            className={css.guidanceBanner}
        />
    )
}
