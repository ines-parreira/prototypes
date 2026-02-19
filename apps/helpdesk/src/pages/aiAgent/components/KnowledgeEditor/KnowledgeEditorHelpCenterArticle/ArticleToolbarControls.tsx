import { Button } from '@gorgias/axiom'

import {
    DeleteButton,
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarCommonControls'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
import { useArticleContext } from './context'
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
    } = useArticleToolbar()

    const versionHistory = useVersionHistory()
    const { dispatch } = useArticleContext()

    const { onClickEdit, onClickPublish, onOpenDeleteModal, onDiscard } =
        actions

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
                        Restore as draft
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
