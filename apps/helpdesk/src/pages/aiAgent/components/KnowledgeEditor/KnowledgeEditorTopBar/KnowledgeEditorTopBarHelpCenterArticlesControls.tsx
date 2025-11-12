import classNames from 'classnames'

import {
    CancelButton,
    DeleteIconButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

import css from './KnowledgeEditorTopBarControls.less'

export enum ArticleModes {
    READ = 'read',
    EDIT_DRAFT = 'editDraft',
    EDIT_PUBLISHED = 'editPublished',
}

export type ArticleMode =
    | {
          mode: ArticleModes.READ
          onEdit: () => void
          onDelete: () => void
          onTest: () => void
      }
    | {
          mode: ArticleModes.EDIT_DRAFT
          onCancel: () => void
          onSaveDraft?: () => void
          onSaveAndPublish?: () => void
      }
    | {
          mode: ArticleModes.EDIT_PUBLISHED
          onCancel: () => void
          onSaveAndPublish?: () => void
      }

type Props = ArticleMode & { disabled?: boolean }

const ReadControls = (props: Extract<Props, { mode: ArticleModes.READ }>) => (
    <>
        <EditIconButton
            onEdit={props.onEdit}
            disabled={props.disabled ?? false}
        />
        <DeleteIconButton
            onDelete={props.onDelete}
            disabled={props.disabled ?? false}
        />
        <TestButton onTest={props.onTest} disabled={props.disabled ?? false} />
    </>
)

const EditDraftControls = (
    props: Extract<Props, { mode: ArticleModes.EDIT_DRAFT }>,
) => (
    <>
        <CancelButton
            onCancel={props.onCancel}
            disabled={props.disabled ?? false}
        />

        <button
            className={classNames(css.button, css.secondaryButton)}
            onClick={props.onSaveDraft}
            disabled={props.onSaveDraft === undefined || props.disabled}
        >
            Save draft
        </button>

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSaveAndPublish}
            disabled={props.onSaveAndPublish === undefined || props.disabled}
        >
            Publish
        </button>
    </>
)

const EditPublishedControls = (
    props: Extract<Props, { mode: ArticleModes.EDIT_PUBLISHED }>,
) => (
    <>
        <CancelButton
            onCancel={props.onCancel}
            disabled={props.disabled ?? false}
        />

        <button
            className={classNames(css.button, css.primaryButton)}
            onClick={props.onSaveAndPublish}
            disabled={props.onSaveAndPublish === undefined || props.disabled}
        >
            Publish
        </button>
    </>
)

export const KnowledgeEditorTopBarHelpCenterArticlesControls = (
    props: Props,
) =>
    props.mode === ArticleModes.READ ? (
        <ReadControls {...props} />
    ) : props.mode === ArticleModes.EDIT_DRAFT ? (
        <EditDraftControls {...props} />
    ) : (
        <EditPublishedControls {...props} />
    )
