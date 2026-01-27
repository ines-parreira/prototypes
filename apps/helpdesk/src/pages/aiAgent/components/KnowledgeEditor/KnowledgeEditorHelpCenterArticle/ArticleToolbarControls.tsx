import { Button } from '@gorgias/axiom'

import {
    DeleteButton,
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarCommonControls'
import { useArticleToolbar } from './hooks/useArticleToolbar'

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

    const { onClickEdit, onClickPublish, onOpenDeleteModal, onDiscard } =
        actions

    switch (toolbarState.type) {
        case 'published-with-draft':
            return (
                <>
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
