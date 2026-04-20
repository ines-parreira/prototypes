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
import { useSkillAutoSave } from './hooks/useSkillAutoSave'
import { KnowledgeEditorSkillVersionBanner } from './KnowledgeEditorSkillVersionBanner'
import { SkillDeleteModal } from './modals/SkillDeleteModal'
import { SkillDisableModal } from './modals/SkillDisableModal'
import { SkillEnableModal } from './modals/SkillEnableModal'
import { SkillPublishModal } from './modals/SkillPublishModal'
import { SkillRestoreVersionModal } from './modals/SkillRestoreVersionModal'
import { KnowledgeEditorSkillReadView } from './read/KnowledgeEditorSkillReadView'
import { SkillEditorSidePanel } from './sidePanel/SkillEditorSidePanel'
import { SkillEditorHeader } from './SkillEditorHeader'

import css from './KnowledgeEditorSkill.less'

export const KnowledgeEditorSkillContent = () => {
    const { shopName, shopType, onClose } = useSkillEditorStore(
        useShallow((storeState) => ({
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
            onClose: storeState.config.onClose,
        })),
    )

    const {
        mode,
        title,
        content,
        historicalVersion,
        comparisonVersion,
        isAutoSaving,
        hasAutoSavedInSession,
        autoSaveError,
        skillLastUpdated,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            title: storeState.state.title,
            content: storeState.state.content,
            historicalVersion: storeState.state.historicalVersion,
            comparisonVersion: storeState.state.comparisonVersion,
            isAutoSaving: storeState.state.isAutoSaving,
            hasAutoSavedInSession: storeState.state.hasAutoSavedInSession,
            autoSaveError: storeState.state.autoSaveError,
            skillLastUpdated: storeState.state.skill?.lastUpdated,
        })),
    )

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const { onChangeField } = useSkillAutoSave()

    const onClickBack = useCallback(() => {
        onClose()
    }, [onClose])

    const onChangeTitle = useCallback(
        (newTitle: string) => {
            onChangeField('title', newTitle)
        },
        [onChangeField],
    )

    const onChangeContent = useCallback(
        (newContent: string) => {
            onChangeField('content', newContent)
        },
        [onChangeField],
    )

    const isEditableMode = mode === 'edit' || mode === 'create'

    const lastUpdatedDatetime =
        isAutoSaving || !hasAutoSavedInSession
            ? undefined
            : skillLastUpdated
              ? new Date(skillLastUpdated)
              : undefined

    return (
        <Box flexDirection="row" height="100%">
            <Box
                flexDirection="column"
                flex={1}
                height="100%"
                className={css.contentContainer}
            >
                <SkillEditorHeader
                    title={title}
                    onChangeTitle={isEditableMode ? onChangeTitle : undefined}
                    onBack={onClickBack}
                    isSaving={isAutoSaving}
                    autoSaveError={autoSaveError}
                    lastUpdatedDatetime={lastUpdatedDatetime}
                >
                    <SkillToolbarControls />
                </SkillEditorHeader>

                <Box
                    flexDirection="column"
                    flex={1}
                    alignItems="center"
                    className={css.editorContent}
                >
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
            <SkillDeleteModal />
            <SkillDisableModal />
            <SkillEnableModal />
            <SkillPublishModal />
            <SkillRestoreVersionModal />
        </Box>
    )
}
