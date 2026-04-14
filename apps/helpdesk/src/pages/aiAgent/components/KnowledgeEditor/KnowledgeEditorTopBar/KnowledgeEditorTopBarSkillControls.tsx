import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Button } from '@gorgias/axiom'

import { hasDraft, useSkillEditorStore } from '../KnowledgeEditorSkill/context'
import type { SkillModeType } from '../KnowledgeEditorSkill/context/types'
import { useSkillVersionHistory } from '../KnowledgeEditorSkill/hooks/useSkillVersionHistory'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import {
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

type SkillToolbarState =
    | { type: 'published-with-draft' }
    | { type: 'published-without-draft' }
    | { type: 'published-without-draft-edit' }
    | { type: 'draft-view' }
    | { type: 'draft-edit' }
    | { type: 'create' }
    | { type: 'viewing-historical-version' }

function getToolbarState(
    mode: SkillModeType,
    isCurrent: boolean | undefined,
    skillHasDraft: boolean,
    isViewingHistoricalVersion: boolean,
): SkillToolbarState {
    if (isViewingHistoricalVersion) {
        return { type: 'viewing-historical-version' }
    }

    if (mode === 'create') {
        return { type: 'create' }
    }

    const isViewingDraft = isCurrent === false
    const isEditMode = mode === 'edit'

    if (isViewingDraft) {
        return isEditMode ? { type: 'draft-edit' } : { type: 'draft-view' }
    }

    if (skillHasDraft) {
        return { type: 'published-with-draft' }
    }

    return isEditMode
        ? { type: 'published-without-draft-edit' }
        : { type: 'published-without-draft' }
}

export const SkillToolbarControls = () => {
    const {
        mode,
        isUpdating,
        isAutoSaving,
        canEditSkill,
        skillIsCurrent,
        historicalPublishedDatetime,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            canEditSkill: !!storeState.state.skill,
            skillIsCurrent: storeState.state.skill?.isCurrent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )

    const skillHasDraft = useSkillEditorStore((storeState) =>
        hasDraft(storeState.state),
    )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const playground = useSkillEditorStore(
        (storeState) => storeState.playground,
    )

    const versionHistory = useSkillVersionHistory()

    const isDisabled = isUpdating || isAutoSaving

    const onEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    const onOpenDiscardModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'discard' })
    }, [dispatch])

    const onOpenDeleteModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'delete' })
    }, [dispatch])

    const toolbarState = getToolbarState(
        mode,
        skillIsCurrent,
        skillHasDraft,
        historicalPublishedDatetime !== null &&
            historicalPublishedDatetime !== undefined,
    )

    const versionHistoryButton = (
        <VersionHistoryButton
            versions={versionHistory.versions}
            isLoading={versionHistory.isLoading}
            currentVersionId={versionHistory.currentVersionId}
            selectedVersionId={versionHistory.selectedVersionId}
            onSelectVersion={versionHistory.onSelectVersion}
            isDisabled={versionHistory.isDisabled}
            isFetchingNextPage={versionHistory.isFetchingNextPage}
            onLoadMore={versionHistory.onLoadMore}
            shouldLoadMore={versionHistory.shouldLoadMore}
        />
    )

    switch (toolbarState.type) {
        case 'viewing-historical-version':
            return (
                <>
                    {versionHistoryButton}
                    {playground.onTest && (
                        <TestButton onTest={playground.onTest} disabled />
                    )}
                </>
            )

        case 'published-with-draft':
            return (
                <>
                    {versionHistoryButton}
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )

        case 'published-without-draft':
            return (
                <>
                    {canEditSkill && (
                        <EditIconButton onEdit={onEdit} disabled={isDisabled} />
                    )}
                    {versionHistoryButton}
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )

        case 'draft-view':
            return (
                <>
                    <EditIconButton onEdit={onEdit} disabled={isDisabled} />
                    {versionHistoryButton}
                    <Button
                        onClick={onOpenPublishModal}
                        isDisabled={isDisabled}
                        variant="primary"
                    >
                        Publish
                    </Button>
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )

        case 'published-without-draft-edit':
            return (
                <>
                    {versionHistoryButton}
                    <DeleteDraftButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onOpenPublishModal}
                        isDisabled
                        variant="primary"
                    >
                        Publish changes
                    </Button>
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )

        case 'draft-edit':
            return (
                <>
                    {versionHistoryButton}
                    <DeleteDraftButton
                        onDelete={onOpenDiscardModal}
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onOpenPublishModal}
                        isDisabled={isDisabled}
                        variant="primary"
                    >
                        Publish changes
                    </Button>
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )

        case 'create':
            return (
                <>
                    <Button
                        variant="primary"
                        onClick={onOpenPublishModal}
                        isDisabled={isDisabled}
                    >
                        Publish changes
                    </Button>
                    {playground.onTest && (
                        <TestButton
                            onTest={playground.onTest}
                            disabled={isDisabled}
                        />
                    )}
                </>
            )
    }
}
