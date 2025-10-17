import classNames from 'classnames'

import {
    CancelButton,
    CopyIconButton,
    DeleteIconButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

type GuidanceMode =
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

type Props = {
    mode: GuidanceMode
}

const ReadControls = (props: Extract<GuidanceMode, { mode: 'read' }>) => (
    <>
        <EditIconButton onEdit={props.onEdit} />
        <CopyIconButton onCopy={props.onCopy} />
        <DeleteIconButton onDelete={props.onDelete} />
        <TestButton onTest={props.onTest} />
    </>
)

const EditControls = (props: Extract<GuidanceMode, { mode: 'edit' }>) => (
    <>
        <CancelButton onCancel={props.onCancel} />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSave}
            disabled={props.onSave === undefined}
        >
            Save
        </button>
    </>
)

const CreateControls = (props: Extract<GuidanceMode, { mode: 'create' }>) => (
    <>
        <CancelButton onCancel={props.onCancel} />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onCreate}
            disabled={props.onCreate === undefined}
        >
            Create
        </button>
    </>
)

export const KnowledgeEditorTopBarGuidanceControls = (props: Props) =>
    props.mode.mode === 'read' ? (
        <ReadControls {...props.mode} />
    ) : props.mode.mode === 'edit' ? (
        <EditControls {...props.mode} />
    ) : (
        <CreateControls {...props.mode} />
    )
