import { useCallback, useEffect, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { getTimezone } from 'state/currentUser/selectors'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import { GuidanceToolbarControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { useGuidanceContext } from './context'
import { useGuidanceAutoSave } from './context/useGuidanceAutoSave'
import { useToggleVisibility } from './context/useToggleVisibility'
import { KnowledgeEditorGuidanceEditView } from './edit/KnowledgeEditorGuidanceEditView'
import { KnowledgeEditorGuidanceVersionBanner } from './KnowledgeEditorGuidanceVersionBanner'
import { KnowledgeEditorGuidanceDeleteModal } from './modals/KnowledgeEditorGuidanceDeleteModal'
import { KnowledgeEditorGuidanceDiscardDraftModal } from './modals/KnowledgeEditorGuidanceDiscardDraftModal'
import { KnowledgeEditorGuidanceUnsavedChangesModal } from './modals/KnowledgeEditorGuidanceUnsavedChangesModal'
import { KnowledgeEditorGuidanceReadView } from './read'

import css from './KnowledgeEditorGuidanceView.less'

type Props = {
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceContent = ({ closeHandlerRef }: Props) => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)

    const { state, dispatch, config, guidanceArticle, hasPendingChanges } =
        useGuidanceContext()

    const {
        shopName,
        shopType,
        guidanceHelpCenter,
        onClickPrevious,
        onClickNext,
        onClose,
    } = config

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const resourceImpact = useResourceMetrics({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!guidanceArticle,
    })

    const impact = useMemo(
        () =>
            isPerformanceStatsEnabled
                ? {
                      tickets: resourceImpact.data?.tickets,
                      handoverTickets: resourceImpact.data?.handoverTickets,
                      csat: resourceImpact.data?.csat,
                      intents: resourceImpact.data?.intents,
                      isLoading: resourceImpact.isLoading,
                  }
                : undefined,
        [isPerformanceStatsEnabled, resourceImpact],
    )

    const { onChangeField } = useGuidanceAutoSave()
    const { toggleVisibility } = useToggleVisibility()

    const isDisabled = state.isUpdating || state.isAutoSaving

    const onClickCancel = useCallback(() => {
        if (hasPendingChanges) {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        } else {
            onClose()
        }
    }, [hasPendingChanges, dispatch, onClose])

    useEffect(() => {
        closeHandlerRef.current = onClickCancel
    }, [closeHandlerRef, onClickCancel])

    return (
        <div className={css.knowledgeEditorContainer}>
            <KnowledgeEditorTopBar
                onClickPrevious={
                    state.guidanceMode !== 'edit' ? onClickPrevious : undefined
                }
                onClickNext={
                    state.guidanceMode !== 'edit' ? onClickNext : undefined
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
                lastUpdatedDatetime={
                    state.isAutoSaving
                        ? undefined
                        : guidanceArticle
                          ? new Date(guidanceArticle.lastUpdated)
                          : undefined
                }
                guidanceMode={state.guidanceMode}
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
                        <KnowledgeEditorSidePanelGuidance
                            details={{
                                aiAgentStatus: {
                                    value: state.visibility,
                                    onChange: toggleVisibility,
                                },
                                createdDatetime: guidanceArticle
                                    ? new Date(guidanceArticle.createdDatetime)
                                    : undefined,
                                lastUpdatedDatetime: guidanceArticle
                                    ? new Date(guidanceArticle.lastUpdated)
                                    : undefined,
                                isUpdating: isDisabled,
                                isDraft:
                                    state.guidance?.isCurrent === undefined
                                        ? false
                                        : !state.guidance?.isCurrent,
                            }}
                            impact={impact}
                        />
                    )}
                </div>
            </div>

            <KnowledgeEditorGuidanceUnsavedChangesModal />
            <KnowledgeEditorGuidanceDiscardDraftModal />
            <KnowledgeEditorGuidanceDeleteModal />
        </div>
    )
}
