import { Button } from '@gorgias/axiom'

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
        isPlaygroundOpen,
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
            variant="secondary"
            isDisabled={isDisabled}
            icon="copy"
        />
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
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
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
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
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
                    <Button
                        onClick={isFormValid ? onClickPublish : undefined}
                        isDisabled={!isFormValid || isDisabled}
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
                </>
            )

        case 'published-without-draft-edit':
            return (
                <>
                    <Button
                        onClick={isFormValid ? onClickPublish : undefined}
                        isDisabled={true}
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={isDisabled} />
                    )}
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
                    <Button
                        onClick={
                            !isCreateMode && isFormValid
                                ? onClickPublish
                                : undefined
                        }
                        isDisabled={isCreateMode || !isFormValid || isDisabled}
                    >
                        Publish
                    </Button>
                    {!isPlaygroundOpen && (
                        <TestButton
                            onTest={onTest}
                            disabled={isCreateMode || isDisabled}
                        />
                    )}
                </>
            )
        }
    }
}
