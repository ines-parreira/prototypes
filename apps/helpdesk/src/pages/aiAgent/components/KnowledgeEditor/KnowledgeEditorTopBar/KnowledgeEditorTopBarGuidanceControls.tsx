import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { useVersionHistory } from '../KnowledgeEditorGuidance/hooks/useVersionHistory'
import { DuplicateGuidance } from '../shared/DuplicateGuidance/DuplicateGuidance'
import { ButtonRenderMode } from '../shared/DuplicateGuidance/types'
import type { TriggerProps } from '../shared/DuplicateGuidance/types'
import { VersionHistoryButton } from '../shared/VersionHistoryButton'
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
        isVersionHistoryEnabled,
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
    const versionHistory = useVersionHistory()

    const copyButtonTrigger = ({ ref }: TriggerProps) => {
        const button = (
            <Button
                ref={ref}
                slot="button"
                variant="secondary"
                isDisabled={isDisabled}
                icon="copy"
            />
        )

        if (isDisabled) {
            return button
        }

        return (
            <Tooltip placement="bottom">
                <TooltipTrigger>{button}</TooltipTrigger>
                <TooltipContent title="Duplicate" />
            </Tooltip>
        )
    }

    const disabledCopyButtonTrigger = ({ ref }: TriggerProps) => (
        <Button
            ref={ref}
            slot="button"
            variant="secondary"
            isDisabled={true}
            icon="copy"
        />
    )
    switch (toolbarState.type) {
        case 'viewing-historical-version':
            return (
                <>
                    {isVersionHistoryEnabled && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
                    <EditIconButton disabled={true} />
                    {articleId && shopName && (
                        <DuplicateGuidance
                            articleIds={[articleId]}
                            shopName={shopName}
                            isDisabled={true}
                            renderMode={ButtonRenderMode.Visible}
                            trigger={disabledCopyButtonTrigger}
                            placement="bottom right"
                            onDuplicate={duplicateGuidanceToShops}
                        />
                    )}
                    <DeleteButton
                        onDelete={onOpenDeleteModal}
                        disabled={true}
                    />
                    {!isPlaygroundOpen && (
                        <TestButton onTest={onTest} disabled={true} />
                    )}
                </>
            )

        case 'published-with-draft':
            return (
                <>
                    {isVersionHistoryEnabled && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
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
                    {isVersionHistoryEnabled && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
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
                    {isVersionHistoryEnabled && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
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
                        onClick={onClickPublish}
                        isDisabled={!isFormValid || isDisabled}
                        variant="primary"
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
                    {isVersionHistoryEnabled && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
                    <DeleteDraftButton
                        onDelete={onOpenDeleteModal}
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onClickPublish}
                        isDisabled
                        variant="primary"
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
            const isPublishDisabled = isCreateMode || !isFormValid || isDisabled
            return (
                <>
                    {isVersionHistoryEnabled && !isCreateMode && (
                        <VersionHistoryButton
                            versions={versionHistory.versions}
                            isLoading={versionHistory.isLoading}
                            currentVersionId={versionHistory.currentVersionId}
                            selectedVersionId={versionHistory.selectedVersionId}
                            onSelectVersion={versionHistory.onSelectVersion}
                            isDisabled={versionHistory.isDisabled}
                            isFetchingNextPage={
                                versionHistory.isFetchingNextPage
                            }
                            onLoadMore={versionHistory.onLoadMore}
                            shouldLoadMore={versionHistory.shouldLoadMore}
                        />
                    )}
                    <DeleteDraftButton
                        onDelete={
                            isCreateMode ? onDiscardCreate : onOpenDiscardModal
                        }
                        disabled={isDisabled}
                    />
                    <Button
                        onClick={onClickPublish}
                        isDisabled={isPublishDisabled}
                        variant="primary"
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
