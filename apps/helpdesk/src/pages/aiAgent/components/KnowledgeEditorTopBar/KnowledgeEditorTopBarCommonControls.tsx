import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

import css from './KnowledgeEditorTopBarControls.less'

export const EditIconButton = (props: { onEdit: () => void }) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onEdit}
        aria-label="edit"
    >
        <Icon name="edit-pencil" />
    </button>
)

export const DeleteIconButton = (props: { onDelete: () => void }) => (
    <button
        className={classNames(css.icon, css.secondaryButton)}
        onClick={props.onDelete}
        aria-label="delete"
    >
        <Icon name="trash-empty" />
    </button>
)

export const CancelButton = (props: { onCancel: () => void }) => (
    <button
        className={classNames(css.button, css.ghostButton)}
        onClick={props.onCancel}
    >
        Cancel
    </button>
)
