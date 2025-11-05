import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import css from './KnowledgeEditorTopBarControls.less'

export const EditIconButton = (props: {
    onEdit: () => void
    disabled?: boolean
}) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onEdit}
        aria-label="edit"
        disabled={props.disabled}
    >
        <Icon name="edit-pencil" />
    </button>
)

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
