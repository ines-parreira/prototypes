import classNames from 'classnames'

import {
    CancelButton,
    DeleteIconButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

export type GuidanceMode =
    | {
          mode: 'read'
          onCopy: () => void
          onEdit: () => void
          onDelete: () => void
          onTest: () => void
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

type Props = GuidanceMode & { disabled?: boolean }

const ReadControls = (props: Extract<Props, { mode: 'read' }>) => (
    <>
        <EditIconButton onEdit={props.onEdit} disabled={props.disabled} />
        {/* TODO: add copy button back in when implemented */}
        {/* <CopyIconButton onCopy={props.onCopy} disabled={props.disabled} /> */}
        <DeleteIconButton onDelete={props.onDelete} disabled={props.disabled} />
        <TestButton onTest={props.onTest} disabled={props.disabled ?? false} />
    </>
)

const EditControls = (props: Extract<Props, { mode: 'edit' }>) => (
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

const CreateControls = (props: Extract<Props, { mode: 'create' }>) => (
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
    props.mode === 'read' ? (
        <ReadControls {...props} />
    ) : props.mode === 'edit' ? (
        <EditControls {...props} />
    ) : (
        <CreateControls {...props} />
    )
