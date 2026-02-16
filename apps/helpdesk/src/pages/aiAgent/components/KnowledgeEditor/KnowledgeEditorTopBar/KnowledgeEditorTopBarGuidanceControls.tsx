import { Button, Menu, MenuItem } from '@gorgias/axiom'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { useVersionHistory } from '../KnowledgeEditorGuidance/hooks/useVersionHistory'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import {
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'
import { useGuidanceToolbar } from './useGuidanceToolbar'

export type GuidanceMode =
    | { mode: 'read' }
    | { mode: 'edit' }
    | { mode: 'create' }
    | { mode: 'diff' }

const MoreActionsMenu = ({
    allDisabled,
    isDisabled,
    showDuplicate,
    onOpenDeleteModal,
    onOpenDuplicateModal,
}: {
    allDisabled: boolean
    isDisabled: boolean
    showDuplicate: boolean
    onOpenDeleteModal: () => void
    onOpenDuplicateModal: () => void
}) => {
    return (
        <Menu
            placement="bottom right"
            trigger={
                <Button
                    variant="secondary"
                    icon="dots-kebab-vertical"
                    isDisabled={allDisabled}
                />
            }
        >
            <>
                {showDuplicate && (
                    <MenuItem
                        id="duplicate"
                        label="Duplicate"
                        leadingSlot="copy"
                        onAction={onOpenDuplicateModal}
                        isDisabled={isDisabled}
                    />
                )}
                <MenuItem
                    id="delete"
                    label="Delete"
                    leadingSlot="trash-empty"
                    intent="destructive"
                    onAction={onOpenDeleteModal}
                    isDisabled={isDisabled}
                />
            </>
        </Menu>
    )
}

export const GuidanceToolbarControls = () => {
    const {
        state: toolbarState,
        actions,
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest,
        isPlaygroundOpen,
    } = useGuidanceToolbar()

    const {
        onClickEdit,
        onClickPublish,
        onOpenDiscardModal,
        onOpenDeleteModal,
        onOpenDuplicateModal,
        onDiscardCreate,
    } = actions

    const { state, config, dispatch } = useGuidanceContext()
    const articleId = state.guidance?.id
    const shopName = config.shopName
    const showDuplicate = !!articleId && !!shopName
    const versionHistory = useVersionHistory()

    switch (toolbarState.type) {
        case 'viewing-historical-version':
            return (
                <>
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
                    <Button
                        variant="primary"
                        onClick={() =>
                            dispatch({
                                type: 'SET_MODAL',
                                payload: 'restore',
                            })
                        }
                    >
                        Restore
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={true} />
                    )}
                </>
            )

        case 'published-with-draft':
            return (
                <>
                    <EditIconButton
                        disabled={isDisabled}
                        disabledReason={editDisabledReason}
                    />
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
                    <MoreActionsMenu
                        allDisabled={isDisabled}
                        isDisabled={isDisabled}
                        showDuplicate={showDuplicate}
                        onOpenDeleteModal={onOpenDeleteModal}
                        onOpenDuplicateModal={onOpenDuplicateModal}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'published-without-draft':
            return (
                <>
                    <EditIconButton
                        onEdit={canEdit ? onClickEdit : undefined}
                        disabled={isDisabled}
                    />
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
                    <MoreActionsMenu
                        allDisabled={isDisabled}
                        isDisabled={isDisabled}
                        showDuplicate={showDuplicate}
                        onOpenDeleteModal={onOpenDeleteModal}
                        onOpenDuplicateModal={onOpenDuplicateModal}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'draft-view':
            return (
                <>
                    <EditIconButton
                        onEdit={onClickEdit}
                        disabled={isDisabled}
                    />
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
                    <MoreActionsMenu
                        allDisabled={isDisabled}
                        isDisabled={isDisabled}
                        showDuplicate={showDuplicate}
                        onOpenDeleteModal={onOpenDeleteModal}
                        onOpenDuplicateModal={onOpenDuplicateModal}
                    />
                    <Button
                        onClick={onClickPublish}
                        isDisabled={!isFormValid || isDisabled}
                        variant="primary"
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'published-without-draft-edit':
            return (
                <>
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
                    <DeleteDraftButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onClickPublish}
                        isDisabled
                        variant="primary"
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'draft-edit':
        case 'create': {
            const isCreateMode = toolbarState.type === 'create'
            const isPublishDisabled = isCreateMode || !isFormValid || isDisabled
            return (
                <>
                    {!isCreateMode && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
                    <DeleteDraftButton
                        onDelete={
                            isCreateMode ? onDiscardCreate : onOpenDiscardModal
                        }
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onClickPublish}
                        isDisabled={isPublishDisabled}
                        variant="primary"
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton
                            onTest={onTest}
                            disabled={isCreateMode || isDisabled}
                        />
                    )}
                </>
            )
        }
    }
}
