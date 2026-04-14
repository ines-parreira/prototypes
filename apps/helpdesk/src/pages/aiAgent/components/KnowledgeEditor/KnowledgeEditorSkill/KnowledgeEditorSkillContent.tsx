import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Box } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { SkillToolbarControls } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarSkillControls'

import { DiffView } from '../shared/DiffView'
import { useSkillEditorStore } from './context'
import { KnowledgeEditorSkillEditView } from './edit/KnowledgeEditorSkillEditView'
import { KnowledgeEditorSkillVersionBanner } from './KnowledgeEditorSkillVersionBanner'
import { KnowledgeEditorSkillReadView } from './read/KnowledgeEditorSkillReadView'
import { SkillEditorSidePanel } from './sidePanel/SkillEditorSidePanel'
import { SkillEditorHeader } from './SkillEditorHeader'

export const KnowledgeEditorSkillContent = () => {
    const { dispatch, shopName, shopType, onClose } = useSkillEditorStore(
        useShallow((storeState) => ({
            dispatch: storeState.dispatch,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
            onClose: storeState.config.onClose,
        })),
    )

    const { mode, title, content, historicalVersion, comparisonVersion } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                mode: storeState.state.mode,
                title: storeState.state.title,
                content: storeState.state.content,
                historicalVersion: storeState.state.historicalVersion,
                comparisonVersion: storeState.state.comparisonVersion,
            })),
        )

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const onClickBack = useCallback(() => {
        onClose()
    }, [onClose])

    const onChangeTitle = useCallback(
        (newTitle: string) => {
            dispatch({ type: 'SET_TITLE', payload: newTitle })
        },
        [dispatch],
    )

    const onChangeContent = useCallback(
        (newContent: string) => {
            dispatch({ type: 'SET_CONTENT', payload: newContent })
        },
        [dispatch],
    )

    const isEditableMode = mode === 'edit' || mode === 'create'

    return (
        <Box flexDirection="row" height="100%">
            <Box flexDirection="column" flex={1} height="100%">
                <SkillEditorHeader
                    title={title}
                    onChangeTitle={isEditableMode ? onChangeTitle : undefined}
                    onBack={onClickBack}
                >
                    <SkillToolbarControls />
                </SkillEditorHeader>

                <Box flexDirection="column" flex={1} alignItems="center">
                    <KnowledgeEditorSkillVersionBanner />

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

                    {mode === 'read' && (
                        <KnowledgeEditorSkillReadView
                            content={content}
                            availableActions={guidanceActions}
                            availableVariables={guidanceVariables}
                        />
                    )}

                    {isEditableMode && (
                        <KnowledgeEditorSkillEditView
                            content={content}
                            onChangeContent={onChangeContent}
                            shopName={shopName}
                            availableActions={guidanceActions}
                            availableVariables={guidanceVariables}
                        />
                    )}
                </Box>
            </Box>

            <SkillEditorSidePanel />
            <DrillDownModal isLegacy={false} />
        </Box>
    )
}
