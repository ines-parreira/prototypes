import classNames from 'classnames'

import { Button, Icon } from '@gorgias/axiom'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { DuplicateGuidance } from '../shared/DuplicateGuidance/DuplicateGuidance'
import { ButtonRenderMode } from '../shared/DuplicateGuidance/types'
import type { TriggerProps } from '../shared/DuplicateGuidance/types'
import {
    DeleteButton,
    DeleteDraftButton,
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'
import { useGuidanceToolbar } from './useGuidanceToolbar'

import css from './KnowledgeEditorTopBarControls.less'

export type GuidanceMode =
    | { mode: 'read' }
    | { mode: 'edit' }
    | { mode: 'create' }

export const GuidanceToolbarControls = () => {
    const {
        state: toolbarState,
        actions,
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest,
    } = useGuidanceToolbar()

    const {
        duplicateGuidanceToShops,
        onClickEdit,
        onClickPublish,
        onOpenDiscardModal,
        onOpenDeleteModal,
        onDiscardCreate,
    } = actions

    const { state, config } = useGuidanceContext()
    const articleId = state.guidance?.id
    const shopName = config.shopName

    const copyButtonTrigger = ({ ref }: TriggerProps) => (
        <Button
            ref={ref}
            slot="button"
            intent="regular"
            size="md"
            variant="secondary"
            isDisabled={isDisabled}
        >
            <Icon name="copy" />
        </Button>
    )
    switch (toolbarState.type) {
        case 'published-with-draft':
            return (
                <>
                    <EditIconButton
                        disabled={isDisabled}
                        disabledReason={editDisabledReason}
                    />
                    {articleId && shopName && (
                        <DuplicateGuidance
                            articleIds={[articleId]}
                            shopName={shopName}
                            isDisabled={isDisabled}
                            renderMode={ButtonRenderMode.Visible}
                            trigger={copyButtonTrigger}
                            placement="bottom right"
                            onDuplicate={duplicateGuidanceToShops}
                        />
                    )}
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'published-without-draft':
            return (
                <>
                    <EditIconButton
                        onEdit={canEdit ? onClickEdit : undefined}
                        disabled={isDisabled}
                    />
                    {articleId && shopName && (
                        <DuplicateGuidance
                            articleIds={[articleId]}
                            shopName={shopName}
                            isDisabled={isDisabled}
                            renderMode={ButtonRenderMode.Visible}
                            trigger={copyButtonTrigger}
                            placement="bottom right"
                            onDuplicate={duplicateGuidanceToShops}
                        />
                    )}
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'draft-view':
            return (
                <>
                    <EditIconButton
                        onEdit={onClickEdit}
                        disabled={isDisabled}
                    />
                    {articleId && shopName && (
                        <DuplicateGuidance
                            articleIds={[articleId]}
                            shopName={shopName}
                            isDisabled={isDisabled}
                            renderMode={ButtonRenderMode.Visible}
                            trigger={copyButtonTrigger}
                            placement="bottom right"
                            onDuplicate={duplicateGuidanceToShops}
                        />
                    )}
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={isFormValid ? onClickPublish : undefined}
                        disabled={!isFormValid || isDisabled}
                    >
                        Publish
                    </button>
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'published-without-draft-edit':
            return (
                <>
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={isFormValid ? onClickPublish : undefined}
                        disabled={true}
                    >
                        Publish
                    </button>
                    <TestButton onTest={onTest} disabled={isDisabled} />
                </>
            )

        case 'draft-edit':
        case 'create': {
            const isCreateMode = toolbarState.type === 'create'
            return (
                <>
                    <DeleteDraftButton
                        onDelete={
                            isCreateMode ? onDiscardCreate : onOpenDiscardModal
                        }
                        disabled={isDisabled}
                    />
                    <button
                        className={classNames(css.button, css.primaryButton)}
                        onClick={
                            !isCreateMode && isFormValid
                                ? onClickPublish
                                : undefined
                        }
                        disabled={isCreateMode || !isFormValid || isDisabled}
                    >
                        Publish
                    </button>
                    <TestButton
                        onTest={onTest}
                        disabled={isCreateMode || isDisabled}
                    />
                </>
            )
        }
    }
}
