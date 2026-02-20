import { useCallback, useEffect } from 'react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import { GuidanceToolbarControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { useGuidanceContext } from './context'
import { useGuidanceAutoSave } from './context/useGuidanceAutoSave'
import { KnowledgeEditorGuidanceDiffView } from './diff/KnowledgeEditorGuidanceDiffView'
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
        state,
        dispatch,
        config,
        hasPendingChanges,
        isFormValid,
        playground,
    } = useGuidanceContext()

    const { shopName, shopType, onClickPrevious, onClickNext, onClose } = config

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const { onChangeField } = useGuidanceAutoSave()

    const isDisabled = state.isUpdating || state.isAutoSaving

    const onClickCancel = useCallback(() => {
        if (state.isAutoSaving) {
            return
        }
        if (hasPendingChanges) {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        } else {
            onClose()
        }
    }, [state.isAutoSaving, hasPendingChanges, dispatch, onClose])

    useEffect(() => {
        closeHandlerRef.current = onClickCancel
    }, [closeHandlerRef, onClickCancel])

    return (
        <div className={css.knowledgeEditorContainer}>
            <KnowledgeEditorTopBar
                onClickPrevious={
                    state.guidanceMode !== 'edit' &&
                    state.guidanceMode !== 'diff'
                        ? onClickPrevious
                        : undefined
                }
                onClickNext={
                    state.guidanceMode !== 'edit' &&
                    state.guidanceMode !== 'diff'
                        ? onClickNext
                        : undefined
                }
                title="Guidance"
                isFullscreen={state.isFullscreen}
                onToggleFullscreen={() =>
                    dispatch({ type: 'TOGGLE_FULLSCREEN' })
                }
                onClose={onClickCancel}
                isDetailsView={state.isDetailsView}
                onToggleDetailsView={() =>
                    dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
                }
                disabled={isDisabled}
                isSaving={state.isAutoSaving}
                autoSaveError={
                    state.autoSaveError || (!isFormValid && hasPendingChanges)
                }
                lastUpdatedDatetime={
                    state.isAutoSaving || !state.hasAutoSavedInSession
                        ? undefined
                        : state.guidance?.lastUpdated
                          ? new Date(state.guidance.lastUpdated)
                          : undefined
                }
                guidanceMode={state.guidanceMode}
                shouldHideFullscreenButton={
                    playground.shouldHideFullscreenButton
                }
            >
                <GuidanceToolbarControls />
            </KnowledgeEditorTopBar>
            <div className={css.editorSection}>
                <div className={css.knowledgeEditor}>
                    <div className={css.editorContainer}>
                        <KnowledgeEditorGuidanceVersionBanner />

                        {state.guidanceMode === 'read' && (
                            <KnowledgeEditorGuidanceReadView
                                content={state.content}
                                title={state.title}
                                availableActions={guidanceActions}
                                availableVariables={guidanceVariables}
                            />
                        )}

                        {state.guidanceMode === 'diff' && (
                            <KnowledgeEditorGuidanceDiffView
                                oldTitle={
                                    state.historicalVersion
                                        ? state.historicalVersion.title
                                        : (state.comparisonVersion?.title ?? '')
                                }
                                oldContent={
                                    state.historicalVersion
                                        ? state.historicalVersion.content
                                        : (state.comparisonVersion?.content ??
                                          '')
                                }
                                newTitle={
                                    state.historicalVersion
                                        ? (state.comparisonVersion?.title ?? '')
                                        : state.title
                                }
                                newContent={
                                    state.historicalVersion
                                        ? (state.comparisonVersion?.content ??
                                          '')
                                        : state.content
                                }
                                availableVariables={guidanceVariables}
                                availableActions={guidanceActions}
                            />
                        )}

                        {(state.guidanceMode === 'edit' ||
                            state.guidanceMode === 'create') && (
                            <KnowledgeEditorGuidanceEditView
                                content={state.content}
                                title={state.title}
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

                    {state.isDetailsView && (
                        <KnowledgeEditorSidePanelGuidance />
                    )}
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
