import classNames from 'classnames'

import {
    DeleteButton,
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarCommonControls'
import { useArticleToolbar } from './hooks/useArticleToolbar'

import css from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarControls.less'

export const ArticleToolbarControls = () => {
    const {
        state: toolbarState,
        actions,
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest,
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
                    <TestButton onTest={onTest} disabled={isDisabled} />
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
                    <TestButton onTest={onTest} disabled={isDisabled} />
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
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={isFormValid ? onClickPublish : undefined}
                        disabled={!isFormValid || isDisabled}
                    >
                        Publish
                    </button>
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'published-without-draft-edit':
            return (
                <>
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={isFormValid ? onClickPublish : undefined}
                        disabled={true}
                    >
                        Publish
                    </button>
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'draft-edit':
        case 'create': {
            const isCreateMode = toolbarState.type === 'create'
            return (
                <>
                    <DeleteDraftButton
                        onDelete={onDiscard}
                        disabled={isDisabled}
                    />
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={
                            !isCreateMode && isFormValid
                                ? onClickPublish
                                : undefined
                        }
                        disabled={isCreateMode || !isFormValid || isDisabled}
                    >
                        Publish
                    </button>
                    <TestButton
                        onTest={onTest}
                        disabled={isCreateMode || isDisabled}
                    />
                </>
            )
        }
    }
}
