import classNames from 'classnames'

import {
    CancelButton,
    DeleteIconButton,
    EditIconButton,
} from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

type ArticleMode =
    | {
          mode: 'read'
          onEdit: () => void
          onDelete: () => void
      }
    | {
          mode: 'editDraft'
          onCancel: () => void
          onSaveDraft?: () => void
          onSaveAndPublish?: () => void
      }
    | {
          mode: 'editPublished'
          onCancel: () => void
          onSaveAndPublish?: () => void
      }

type Props = {
    mode: ArticleMode
}

const ReadControls = (props: Extract<ArticleMode, { mode: 'read' }>) => (
    <>
        <EditIconButton onEdit={props.onEdit} />
        <DeleteIconButton onDelete={props.onDelete} />
    </>
)

const EditDraftControls = (
    props: Extract<ArticleMode, { mode: 'editDraft' }>,
) => (
    <>
        <CancelButton onCancel={props.onCancel} />

        <button
            className={classNames(css.button, css.secondaryButton)}
            onClick={props.onSaveDraft}
            disabled={props.onSaveDraft === undefined}
        >
            Save draft
        </button>

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSaveAndPublish}
            disabled={props.onSaveAndPublish === undefined}
        >
            Save & publish
        </button>
    </>
)

const EditPublishedControls = (
    props: Extract<ArticleMode, { mode: 'editPublished' }>,
) => (
    <>
        <CancelButton onCancel={props.onCancel} />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSaveAndPublish}
            disabled={props.onSaveAndPublish === undefined}
        >
            Save & publish
        </button>
    </>
)

export const KnowledgeEditorTopBarHelpCenterArticlesControls = (
    props: Props,
) =>
    props.mode.mode === 'read' ? (
        <ReadControls {...props.mode} />
    ) : props.mode.mode === 'editDraft' ? (
        <EditDraftControls {...props.mode} />
    ) : (
        <EditPublishedControls {...props.mode} />
    )
