import { Button } from '@gorgias/axiom'

import {
    CancelButton,
    DeleteIconButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

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
          onSaveAndPublish?: (commitMessage?: string) => void
      }
    | {
          mode: ArticleModes.EDIT_PUBLISHED
          onCancel: () => void
          onSaveAndPublish?: (commitMessage?: string) => void
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
) => {
    const isPublishDisabled =
        props.onSaveAndPublish === undefined || props.disabled

    return (
        <>
            <CancelButton
                onCancel={props.onCancel}
                disabled={props.disabled ?? false}
            />

            <Button
                onClick={props.onSaveDraft}
                isDisabled={props.onSaveDraft === undefined || props.disabled}
                variant="secondary"
            >
                Save draft
            </Button>

            <Button
                onClick={() => props.onSaveAndPublish?.()}
                isDisabled={isPublishDisabled}
                variant="primary"
            >
                Publish
            </Button>
        </>
    )
}

const EditPublishedControls = (
    props: Extract<Props, { mode: ArticleModes.EDIT_PUBLISHED }>,
) => {
    const isPublishDisabled =
        props.onSaveAndPublish === undefined || props.disabled

    return (
        <>
            <CancelButton
                onCancel={props.onCancel}
                disabled={props.disabled ?? false}
            />

            <Button
                onClick={() => props.onSaveAndPublish?.()}
                isDisabled={isPublishDisabled}
                variant="primary"
            >
                Publish
            </Button>
        </>
    )
}

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
