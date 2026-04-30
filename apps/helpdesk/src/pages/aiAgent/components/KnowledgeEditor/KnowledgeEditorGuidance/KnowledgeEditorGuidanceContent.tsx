import { useCallback, useEffect } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { areTrimmedStringsEqual } from 'common/knowledge-editor/utils'
import { GuidanceDisabledActionsBar } from 'pages/aiAgent/components/GuidanceEditor/GuidanceDisabledActionsBar'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import { GuidanceToolbarControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { DiffView } from '../shared/DiffView'
import { isFormValid, useGuidanceStore } from './context'
import { useGuidanceAutoSave } from './context/useGuidanceAutoSave'
import { KnowledgeEditorGuidanceEditView } from './edit/KnowledgeEditorGuidanceEditView'
import { KnowledgeEditorGuidanceVersionBanner } from './KnowledgeEditorGuidanceVersionBanner'
import { KnowledgeEditorGuidanceDeleteModal } from './modals/KnowledgeEditorGuidanceDeleteModal'
import { KnowledgeEditorGuidanceDiscardDraftModal } from './modals/KnowledgeEditorGuidanceDiscardDraftModal'
import { KnowledgeEditorGuidanceDuplicateModal } from './modals/KnowledgeEditorGuidanceDuplicateModal'
import { KnowledgeEditorGuidancePublishModal } from './modals/KnowledgeEditorGuidancePublishModal'
import { KnowledgeEditorGuidanceRestoreVersionModal } from './modals/KnowledgeEditorGuidanceRestoreVersionModal'
import { KnowledgeEditorGuidanceUnsavedChangesModal } from './modals/KnowledgeEditorGuidanceUnsavedChangesModal'
import { KnowledgeEditorGuidanceReadView } from './read'

import css from './KnowledgeEditorGuidanceView.less'

type Props = {
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceContent = ({ closeHandlerRef }: Props) => {
    const {
        dispatch,
        shopName,
        shopType,
        onClickPrevious,
        onClickNext,
        onClose,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            dispatch: storeState.dispatch,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
            onClickPrevious: storeState.config.onClickPrevious,
            onClickNext: storeState.config.onClickNext,
            onClose: storeState.config.onClose,
        })),
    )

    const {
        mode,
        isFullscreen,
        isDetailsView,
        isUpdating,
        isAutoSaving,
        hasAutoSavedInSession,
        guidanceLastUpdated,
        autoSaveError,
        title,
        content,
        historicalVersion,
        comparisonVersion,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            isFullscreen: storeState.state.isFullscreen,
            isDetailsView: storeState.state.isDetailsView,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            hasAutoSavedInSession: storeState.state.hasAutoSavedInSession,
            guidanceLastUpdated: storeState.state.guidance?.lastUpdated,
            autoSaveError: storeState.state.autoSaveError,
            title: storeState.state.title,
            content: storeState.state.content,
            historicalVersion: storeState.state.historicalVersion,
            comparisonVersion: storeState.state.comparisonVersion,
        })),
    )

    const shouldHideFullscreenButton = useGuidanceStore(
        (storeState) => storeState.playground.shouldHideFullscreenButton,
    )

    const hasPendingChanges = useGuidanceStore((storeState) => {
        const state = storeState.state

        if (state.mode === 'read' || state.mode === 'diff') {
            return false
        }

        return (
            !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
            state.content !== state.savedSnapshot.content
        )
    })
    const guidanceIsFormValid = useGuidanceStore((storeState) =>
        isFormValid(storeState.state),
    )

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const { onChangeField } = useGuidanceAutoSave()

    const isDisabled = isUpdating || isAutoSaving

    const onClickCancel = useCallback(() => {
        if (isAutoSaving) {
            return
        }
        if (hasPendingChanges) {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        } else {
            onClose()
        }
    }, [isAutoSaving, hasPendingChanges, dispatch, onClose])

    useEffect(() => {
        closeHandlerRef.current = onClickCancel
    }, [closeHandlerRef, onClickCancel])

    return (
        <div className={css.knowledgeEditorContainer}>
            <KnowledgeEditorTopBar
                onClickPrevious={
                    mode !== 'edit' && mode !== 'diff'
                        ? onClickPrevious
                        : undefined
                }
                onClickNext={
                    mode !== 'edit' && mode !== 'diff' ? onClickNext : undefined
                }
                title="Guidance"
                isFullscreen={isFullscreen}
                onToggleFullscreen={() =>
                    dispatch({ type: 'TOGGLE_FULLSCREEN' })
                }
                onClose={onClickCancel}
                isDetailsView={isDetailsView}
                onToggleDetailsView={() =>
                    dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
                }
                disabled={isDisabled}
                isSaving={isAutoSaving}
                autoSaveError={
                    autoSaveError || (!guidanceIsFormValid && hasPendingChanges)
                }
                lastUpdatedDatetime={
                    isAutoSaving || !hasAutoSavedInSession
                        ? undefined
                        : guidanceLastUpdated
                          ? new Date(guidanceLastUpdated)
                          : undefined
                }
                editorMode={mode}
                shouldHideFullscreenButton={shouldHideFullscreenButton}
            >
                <GuidanceToolbarControls />
            </KnowledgeEditorTopBar>
            <div className={css.editorSection}>
                <div className={css.knowledgeEditor}>
                    <div className={css.editorContainer}>
                        <KnowledgeEditorGuidanceVersionBanner />

                        {mode !== 'diff' && <GuidanceDisabledActionsBar />}

                        {mode === 'read' && (
                            <KnowledgeEditorGuidanceReadView
                                content={content}
                                title={title}
                                shopName={shopName}
                                availableActions={guidanceActions}
                                availableVariables={guidanceVariables}
                            />
                        )}

                        {mode === 'diff' && (
                            <DiffView
                                oldTitle={
                                    historicalVersion
                                        ? historicalVersion.title
                                        : (comparisonVersion?.title ?? '')
                                }
                                oldContent={
                                    historicalVersion
                                        ? historicalVersion.content
                                        : (comparisonVersion?.content ?? '')
                                }
                                newTitle={
                                    historicalVersion
                                        ? (comparisonVersion?.title ?? '')
                                        : title
                                }
                                newContent={
                                    historicalVersion
                                        ? (comparisonVersion?.content ?? '')
                                        : content
                                }
                                availableVariables={guidanceVariables}
                                availableActions={guidanceActions}
                            />
                        )}

                        {(mode === 'edit' || mode === 'create') && (
                            <KnowledgeEditorGuidanceEditView
                                content={content}
                                title={title}
                                onChangeContent={(content) =>
                                    onChangeField('content', content)
                                }
                                onChangeTitle={(title) =>
                                    onChangeField('title', title)
                                }
                                shopName={shopName}
                                availableActions={guidanceActions}
                                availableVariables={guidanceVariables}
                            />
                        )}
                    </div>

                    {isDetailsView && <KnowledgeEditorSidePanelGuidance />}
                </div>
            </div>

            <KnowledgeEditorGuidanceUnsavedChangesModal />
            <KnowledgeEditorGuidanceDiscardDraftModal />
            <KnowledgeEditorGuidanceDeleteModal />
            <KnowledgeEditorGuidanceDuplicateModal />
            <KnowledgeEditorGuidancePublishModal />
            <KnowledgeEditorGuidanceRestoreVersionModal />
        </div>
    )
}
