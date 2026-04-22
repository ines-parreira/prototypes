import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import {
    isFormValid,
    useSkillEditorStore,
} from '../KnowledgeEditorSkill/context'
import type { SkillModeType } from '../KnowledgeEditorSkill/context/types'
import { useSkillVersionHistory } from '../KnowledgeEditorSkill/hooks/useSkillVersionHistory'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import { DeleteButton, TestButton } from './KnowledgeEditorTopBarCommonControls'

type SkillToolbarState =
    | { type: 'new-skill' }
    | { type: 'draft-only' }
    | { type: 'published-with-draft-changes' }
    | { type: 'published-enabled' }
    | { type: 'published-disabled' }
    | { type: 'viewing-historical-version' }

export function getToolbarState(
    mode: SkillModeType,
    isCurrent: boolean | undefined,
    isViewingHistoricalVersion: boolean,
    isEnabled: boolean,
    hasPublishedVersion: boolean,
): SkillToolbarState {
    if (isViewingHistoricalVersion) {
        return { type: 'viewing-historical-version' }
    }

    if (mode === 'create') {
        return { type: 'new-skill' }
    }

    if (isCurrent === true) {
        return isEnabled
            ? { type: 'published-enabled' }
            : { type: 'published-disabled' }
    }

    if (!hasPublishedVersion) {
        return { type: 'draft-only' }
    }

    return { type: 'published-with-draft-changes' }
}

export const SkillToolbarControls = () => {
    const {
        mode,
        isUpdating,
        isAutoSaving,
        skillIsCurrent,
        visibility,
        hasPublishedVersion,
        historicalPublishedDatetime,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            skillIsCurrent: storeState.state.skill?.isCurrent,
            visibility: storeState.state.visibility,
            hasPublishedVersion: !!storeState.state.skill?.publishedVersionId,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )

    const formValid = useSkillEditorStore((storeState) =>
        isFormValid(storeState.state),
    )

    const { hasTitle, hasContent, hasIntents } = useSkillEditorStore(
        useShallow((storeState) => ({
            hasTitle: storeState.state.title.trim() !== '',
            hasContent: storeState.state.content.trim() !== '',
            hasIntents: storeState.state.intents.length > 0,
        })),
    )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const playground = useSkillEditorStore(
        (storeState) => storeState.playground,
    )

    const versionHistory = useSkillVersionHistory()

    const isBusy = isUpdating || isAutoSaving

    const getValidationTooltip = (
        action: 'publish' | 'enable',
    ): string | undefined => {
        if (formValid) return undefined

        const missing = [
            !hasTitle && 'title',
            !hasContent && 'instructions',
            !hasIntents && 'intents',
        ].filter(Boolean)

        if (action === 'enable') {
            if (missing.length > 1)
                return 'Fill in the required fields to enable this skill'
            if (!hasTitle) return 'Add a title to enable this skill'
            if (!hasContent) return 'Add instructions to enable this skill'
            if (!hasIntents)
                return 'Link at least one intent to enable this skill'
            return undefined
        }

        if (missing.length > 1)
            return 'Fill in the required fields to publish changes'
        if (!hasTitle) return 'Add title to publish changes'
        if (!hasContent) return 'Add instructions to publish changes'
        if (!hasIntents) return 'Link at least one intent to publish changes'
        return undefined
    }

    const publishValidationTooltip = getValidationTooltip('publish')
    const enableValidationTooltip = getValidationTooltip('enable')

    const onOpenEnableModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'enable' })
    }, [dispatch])

    const onOpenDisableModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'disable' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    const onOpenRestoreModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'restore' })
    }, [dispatch])

    const onOpenDeleteModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'delete' })
    }, [dispatch])

    const toolbarState = getToolbarState(
        mode,
        skillIsCurrent,
        historicalPublishedDatetime !== null &&
            historicalPublishedDatetime !== undefined,
        visibility,
        hasPublishedVersion,
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

    const deleteButton = (
        <DeleteButton onDelete={onOpenDeleteModal} disabled={isBusy} />
    )

    const testButton = playground.onTest ? (
        <TestButton onTest={playground.onTest} disabled={isBusy} />
    ) : null

    const wrapWithValidationTooltip = (
        button: React.ReactElement,
        tooltip: string | undefined,
    ) =>
        tooltip ? (
            <Tooltip placement="bottom" trigger={button}>
                <TooltipContent caption={tooltip} />
            </Tooltip>
        ) : (
            button
        )

    const enableButton = wrapWithValidationTooltip(
        <Button
            variant="primary"
            onClick={onOpenEnableModal}
            isDisabled={isBusy || !formValid}
        >
            Enable
        </Button>,
        enableValidationTooltip,
    )

    const disableButton = (
        <Button
            variant="primary"
            onClick={onOpenDisableModal}
            isDisabled={isBusy}
        >
            Disable
        </Button>
    )

    const publishButton = wrapWithValidationTooltip(
        <Button
            variant="primary"
            onClick={onOpenPublishModal}
            isDisabled={isBusy || !formValid}
        >
            Publish changes
        </Button>,
        publishValidationTooltip,
    )

    const restoreButton = (
        <Button
            variant="primary"
            onClick={onOpenRestoreModal}
            isDisabled={isBusy}
        >
            Restore draft
        </Button>
    )

    switch (toolbarState.type) {
        case 'new-skill':
            return (
                <>
                    {enableButton}
                    {testButton}
                </>
            )

        case 'draft-only':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {enableButton}
                    {testButton}
                </>
            )

        case 'published-enabled':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {disableButton}
                    {testButton}
                </>
            )

        case 'published-disabled':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {enableButton}
                    {testButton}
                </>
            )

        case 'published-with-draft-changes':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {publishButton}
                    {testButton}
                </>
            )

        case 'viewing-historical-version':
            return (
                <>
                    {versionHistoryButton}
                    {restoreButton}
                    {playground.onTest && (
                        <TestButton onTest={playground.onTest} disabled />
                    )}
                </>
            )
    }
}
