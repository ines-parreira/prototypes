import classNames from 'classnames'

import editPencil from 'assets/img/knowledge/icons/edit-pencil.svg'
import trashEmpty from 'assets/img/knowledge/icons/trash-empty.svg'

import css from './KnowledgeEditorTopBarControls.less'

type GuidanceMode =
    | {
          mode: 'readonly'
          onEdit: () => void
          onDelete: () => void
      }
    | {
          mode: 'edit'
          onSave?: () => void // undefined is button is disabled
          onCancel: () => void
      }
    | {
          mode: 'create'
          onCreate?: () => void // undefined is button is disabled
          onCancel: () => void
      }

type Props = {
    mode: GuidanceMode
}

const ReadOnlyControls = (
    props: Extract<GuidanceMode, { mode: 'readonly' }>,
) => (
    <>
        <button
            className={classNames(css.icon, css.filledButton)}
            onClick={props.onEdit}
        >
            <img src={editPencil} alt="edit" />
        </button>

        <button
            className={classNames(css.icon, css.filledButton)}
            onClick={props.onDelete}
        >
            <img src={trashEmpty} alt="delete" />
        </button>
    </>
)

const EditControls = (props: Extract<GuidanceMode, { mode: 'edit' }>) => (
    <>
        <button
            className={classNames(css.button, css.ghostButton)}
            onClick={props.onCancel}
        >
            Cancel
        </button>

        <button
            className={classNames(
                css.button,
                css.primaryButton,
                props.onSave ? undefined : css.disabled,
            )}
            onClick={props.onSave}
            disabled={props.onSave === undefined}
        >
            Save
        </button>
    </>
)

const CreateControls = (props: Extract<GuidanceMode, { mode: 'create' }>) => (
    <>
        <button
            className={classNames(css.button, css.ghostButton)}
            onClick={props.onCancel}
        >
            Cancel
        </button>

        <button
            className={classNames(
                css.button,
                css.primaryButton,
                props.onCreate ? undefined : css.disabled,
            )}
            onClick={props.onCreate}
            disabled={props.onCreate === undefined}
        >
            Create
        </button>
    </>
)

export const KnowledgeEditorTopBarGuidanceControls = (props: Props) =>
    props.mode.mode === 'readonly' ? (
        <ReadOnlyControls {...props.mode} />
    ) : props.mode.mode === 'edit' ? (
        <EditControls {...props.mode} />
    ) : (
        <CreateControls {...props.mode} />
    )
