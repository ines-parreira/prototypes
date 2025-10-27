import classNames from 'classnames'

import {
    CancelButton,
    DeleteIconButton,
    EditIconButton,
} from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

export type GuidanceMode =
    | {
          mode: 'read'
          onCopy: () => void
          onEdit: () => void
          onDelete: () => void
      }
    | {
          mode: 'edit'
          onSave?: () => void // undefined if button is disabled
          onCancel: () => void
      }
    | {
          mode: 'create'
          onCreate?: () => void // undefined if button is disabled
          onCancel: () => void
      }

type Props = {
    mode: GuidanceMode
    isUpdating: boolean
}

const ReadControls = (
    props: Extract<GuidanceMode, { mode: 'read' }> & { disabled: boolean },
) => (
    <>
        <EditIconButton onEdit={props.onEdit} disabled={props.disabled} />
        {/* TODO: add copy button back in when implemented */}
        {/* <CopyIconButton onCopy={props.onCopy} disabled={props.disabled} /> */}
        <DeleteIconButton onDelete={props.onDelete} disabled={props.disabled} />
    </>
)

const EditControls = (
    props: Extract<GuidanceMode, { mode: 'edit' }> & { disabled: boolean },
) => (
    <>
        <CancelButton onCancel={props.onCancel} disabled={props.disabled} />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSave}
            disabled={props.onSave === undefined || props.disabled}
        >
            Save
        </button>
    </>
)

const CreateControls = (
    props: Extract<GuidanceMode, { mode: 'create' }> & { disabled: boolean },
) => (
    <>
        <CancelButton onCancel={props.onCancel} disabled={props.disabled} />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onCreate}
            disabled={props.onCreate === undefined || props.disabled}
        >
            Create
        </button>
    </>
)

export const KnowledgeEditorTopBarGuidanceControls = (props: Props) =>
    props.mode.mode === 'read' ? (
        <ReadControls {...props.mode} disabled={props.isUpdating} />
    ) : props.mode.mode === 'edit' ? (
        <EditControls {...props.mode} disabled={props.isUpdating} />
    ) : (
        <CreateControls {...props.mode} disabled={props.isUpdating} />
    )
