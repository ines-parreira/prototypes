import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Box, Button, Separator, Tooltip, TooltipContent } from '@gorgias/axiom'

import {
    isFormValid,
    useSkillEditorStore,
} from '../KnowledgeEditorSkill/context'
import type { SkillModeType } from '../KnowledgeEditorSkill/context/types'
import { useSkillVersionHistory } from '../KnowledgeEditorSkill/hooks/useSkillVersionHistory'
import { useSkillEnableModal } from '../KnowledgeEditorSkill/modals/useSkillEnableModal'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import {
    DeleteButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

type SkillToolbarState =
    | { type: 'new-skill' }
    | { type: 'draft-only' }
    | { type: 'published-with-draft-changes' }
    | { type: 'published-enabled' }
    | { type: 'published-disabled' }
    | { type: 'viewing-historical-version' }
    | { type: 'preview-read' }
    | { type: 'preview-edit' }
    | { type: 'preview-previous-version' }

export function getToolbarState(
    mode: SkillModeType,
    isPreview: boolean | undefined,
    isCurrent: boolean | undefined,
    isViewingHistoricalVersion: boolean,
    isEnabled: boolean,
    hasPublishedVersion: boolean,
): SkillToolbarState {
    if (!!isPreview) {
        if (isViewingHistoricalVersion)
            return { type: 'preview-previous-version' }
        if (mode === 'edit') return { type: 'preview-edit' }
        return { type: 'preview-read' }
    }

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
        isDetailsView,
        isFullScreen,
        isUpdating,
        isAutoSaving,
        isPreview,
        skillIsCurrent,
        visibility,
        hasPublishedVersion,
        historicalPublishedDatetime,
        onClose,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            isDetailsView: storeState.state.isDetailsView,
            isFullScreen: storeState.state.isFullscreen,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            isPreview: storeState.config.isPreviewMode,
            skillIsCurrent: storeState.state.skill?.isCurrent,
            visibility: storeState.state.visibility,
            hasPublishedVersion: !!storeState.state.skill?.publishedVersionId,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            onClose: storeState.config.onClose,
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

    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

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

    const { requestEnable } = useSkillEnableModal()

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

    const onEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onToggleDetailsView = useCallback(() => {
        dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
    }, [dispatch])

    const onToggleFullscreen = useCallback(() => {
        dispatch({ type: 'TOGGLE_FULLSCREEN' })
    }, [dispatch])

    const toolbarState = getToolbarState(
        mode,
        isPreview,
        skillIsCurrent,
        isViewingHistoricalVersion,
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
        <TestButton
            onTest={playground.onTest}
            disabled={isBusy || (isPreview && isViewingHistoricalVersion)}
        />
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
            intent="success"
            onClick={requestEnable}
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

    const editButton = <EditIconButton onEdit={onEdit} disabled={isBusy} />

    const detailsViewToggle = (
        <Tooltip
            trigger={
                <Button
                    variant="tertiary"
                    icon={
                        isDetailsView
                            ? 'system-bar-collapse'
                            : 'system-bar-expand'
                    }
                    aria-label={isDetailsView ? 'Collapse' : 'Expand'}
                    onClick={onToggleDetailsView}
                />
            }
        >
            <TooltipContent title={isDetailsView ? 'Collapse' : 'Expand'} />
        </Tooltip>
    )

    const separator = (
        <Box height={32}>
            <Separator direction="vertical" />
        </Box>
    )

    const fullscreenToogle = (
        <Tooltip
            trigger={
                <Button
                    variant="tertiary"
                    icon={isFullScreen ? 'arrow-collapse' : 'arrow-expand'}
                    aria-label={
                        isFullScreen ? 'Leave fullscreen' : 'fullscreen'
                    }
                    onClick={onToggleFullscreen}
                />
            }
        >
            <TooltipContent
                title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            />
        </Tooltip>
    )

    const closeButton = (
        <Tooltip
            trigger={
                <Button
                    variant="tertiary"
                    icon="close"
                    aria-label="close"
                    onClick={onClose}
                    isDisabled={isBusy}
                />
            }
        >
            <TooltipContent title="Close" />
        </Tooltip>
    )

    switch (toolbarState.type) {
        case 'new-skill':
            return (
                <>
                    {deleteButton}
                    {enableButton}
                    {testButton}
                </>
            )

        case 'draft-only':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {separator}
                    {enableButton}
                    {testButton}
                </>
            )

        case 'published-enabled':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {separator}
                    {disableButton}
                    {testButton}
                </>
            )

        case 'published-disabled':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {separator}
                    {enableButton}
                    {testButton}
                </>
            )

        case 'published-with-draft-changes':
            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {separator}
                    {publishButton}
                    {testButton}
                </>
            )

        case 'viewing-historical-version':
            return (
                <>
                    {versionHistoryButton}
                    {separator}
                    {restoreButton}
                    {playground.onTest && (
                        <TestButton onTest={playground.onTest} disabled />
                    )}
                </>
            )

        case 'preview-read':
            return (
                <>
                    {editButton}
                    {versionHistoryButton}
                    {testButton}
                    {detailsViewToggle}
                    {separator}
                    {fullscreenToogle}
                    {closeButton}
                </>
            )

        case 'preview-edit': {
            const actionButton =
                skillIsCurrent === true
                    ? visibility
                        ? disableButton
                        : enableButton
                    : !hasPublishedVersion
                      ? enableButton
                      : publishButton

            return (
                <>
                    {deleteButton}
                    {versionHistoryButton}
                    {actionButton}
                    {testButton}
                    {detailsViewToggle}
                    {separator}
                    {fullscreenToogle}
                    {closeButton}
                </>
            )
        }

        case 'preview-previous-version':
            return (
                <>
                    {versionHistoryButton}
                    {restoreButton}
                    {testButton}
                    {detailsViewToggle}
                    {separator}
                    {fullscreenToogle}
                    {closeButton}
                </>
            )
    }
}
