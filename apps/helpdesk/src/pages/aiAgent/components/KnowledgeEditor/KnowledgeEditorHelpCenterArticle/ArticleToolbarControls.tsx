import { Button } from '@gorgias/axiom'

import {
    DeleteButton,
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarCommonControls'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import { useArticleToolbar } from './hooks/useArticleToolbar'
import { useVersionHistory } from './hooks/useVersionHistory'

export const ArticleToolbarControls = () => {
    const {
        state: toolbarState,
        actions,
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest,
        isPlaygroundOpen,
        isVersionHistoryEnabled,
    } = useArticleToolbar()

    const versionHistory = useVersionHistory()

    const { onClickEdit, onClickPublish, onOpenDeleteModal, onDiscard } =
        actions

    switch (toolbarState.type) {
        case 'viewing-historical-version':
            return (
                <>
                    {isVersionHistoryEnabled && (
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
                    <EditIconButton disabled={true} />
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={true}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={true} />
                    )}
                </>
            )

        case 'published-with-draft':
            return (
                <>
                    {isVersionHistoryEnabled && (
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
                    <EditIconButton
                        disabled={isDisabled}
                        disabledReason={editDisabledReason}
                    />
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'published-without-draft':
            return (
                <>
                    {isVersionHistoryEnabled && (
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
                    <EditIconButton
                        onEdit={canEdit ? onClickEdit : undefined}
                        disabled={isDisabled}
                    />
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'draft-view':
            return (
                <>
                    {isVersionHistoryEnabled && (
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
                    <EditIconButton
                        onEdit={onClickEdit}
                        disabled={isDisabled}
                    />
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
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
                    {isVersionHistoryEnabled && (
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
                    {isVersionHistoryEnabled && !isCreateMode && (
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
                        onDelete={onDiscard}
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
