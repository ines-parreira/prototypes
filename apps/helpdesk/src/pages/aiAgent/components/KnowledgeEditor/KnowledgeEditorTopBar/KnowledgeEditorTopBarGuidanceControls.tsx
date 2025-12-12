import classNames from 'classnames'

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import {
    DeleteButton,
    DiscardDraftButton,
    DuplicateButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'
import { useGuidanceToolbar } from './useGuidanceToolbar'

import css from './KnowledgeEditorTopBarControls.less'

export type GuidanceMode =
    | { mode: 'read' }
    | { mode: 'edit' }
    | { mode: 'create' }

const EditIconButton = (props: {
    onEdit?: () => void
    disabled?: boolean
    disabledReason?: string
}) => {
    const isDisabled = props.disabled || !props.onEdit

    const button = (
        <button
            className={classNames(css.icon, css.secondaryButton)}
            onClick={props.onEdit}
            aria-label="edit"
            disabled={isDisabled}
        >
            <Icon name="edit-pencil" />
        </button>
    )

    if (props.disabledReason && !props.onEdit) {
        return (
            <Tooltip placement="bottom">
                <TooltipTrigger>{button}</TooltipTrigger>
                <TooltipContent title={props.disabledReason} />
            </Tooltip>
        )
    }

    return button
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
    } = useGuidanceToolbar()

    const {
        duplicate,
        onClickEdit,
        onClickPublish,
        onOpenDiscardModal,
        onOpenDeleteModal,
        onDiscardCreate,
    } = actions

    switch (toolbarState.type) {
        case 'published-with-draft':
            return (
                <>
                    <EditIconButton
                        disabled={isDisabled}
                        disabledReason={editDisabledReason}
                    />
                    <DuplicateButton
                        onDuplicate={duplicate}
                        disabled={isDisabled}
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
                    <DuplicateButton
                        onDuplicate={duplicate}
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
                    <DuplicateButton
                        onDuplicate={duplicate}
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
                    <DiscardDraftButton
                        onDiscard={
                            isCreateMode ? onDiscardCreate : onOpenDiscardModal
                        }
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
