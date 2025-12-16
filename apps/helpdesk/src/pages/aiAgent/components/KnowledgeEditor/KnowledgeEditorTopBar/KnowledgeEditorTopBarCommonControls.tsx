import classNames from 'classnames'

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import css from './KnowledgeEditorTopBarControls.less'

export const EditIconButton = (props: {
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

export const DeleteIconButton = (props: {
    onDelete: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onDelete}
        aria-label="delete"
        disabled={props.disabled}
    >
        <Icon name="trash-empty" />
    </button>
)

export const CancelButton = (props: {
    onCancel: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.button, css.ghostButton)}
        onClick={props.onCancel}
        aria-label="cancel"
        disabled={props.disabled}
    >
        Cancel
    </button>
)

export const DiscardDraftButton = (props: {
    onDiscard: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.button, css.ghostButton)}
        onClick={props.onDiscard}
        aria-label="discard draft"
        disabled={props.disabled}
    >
        Discard
    </button>
)

export const CopyIconButton = (props: {
    onCopy: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onCopy}
        aria-label="copy"
        disabled={props.disabled}
    >
        <Icon name="copy" />
    </button>
)

export const DuplicateButton = (props: {
    onDuplicate?: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onDuplicate}
        aria-label="duplicate"
        disabled={props.disabled || !props.onDuplicate}
    >
        <Icon name="copy" />
    </button>
)

export const DeleteButton = (props: {
    onDelete?: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.icon, css.destructiveButton)}
        onClick={props.onDelete}
        aria-label="delete"
        disabled={props.disabled || !props.onDelete}
    >
        <Icon name="trash-empty" />
    </button>
)

export const TestButton = (props: {
    onTest: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.button, css.secondaryButton)}
        onClick={props.onTest}
        aria-label="test"
        disabled={props.disabled}
    >
        Test
    </button>
)
