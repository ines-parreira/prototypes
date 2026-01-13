import { useId } from '@repo/hooks'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

type HeaderActionsProps = {
    data: GroupedKnowledgeItem | null
    onAddKnowledge?: () => void
    onTest?: () => void
    onSync?: () => void
    onDelete?: () => void
    isTestButtonDisabled?: boolean
    isAddKnowledgeButtonDisabled?: boolean
    isSyncButtonDisabled?: boolean
    isDeleteButtonDisabled?: boolean
    syncTooltipMessage?: string
    isPlaygroundOpen?: boolean
}

export const HeaderActions = ({
    data,
    onAddKnowledge,
    onTest,
    onSync,
    onDelete,
    isTestButtonDisabled = false,
    isAddKnowledgeButtonDisabled = false,
    isSyncButtonDisabled = false,
    isDeleteButtonDisabled = false,
    syncTooltipMessage,
    isPlaygroundOpen = false,
}: HeaderActionsProps) => {
    const id = useId()
    const syncButtonId = `sync-button-${id}`
    if (!data) {
        return (
            <>
                {!isPlaygroundOpen && (
                    <Button
                        onClick={onTest}
                        isDisabled={isTestButtonDisabled}
                        aria-label="Test knowledge"
                        variant="secondary"
                    >
                        Test
                    </Button>
                )}
                <Button
                    onClick={onAddKnowledge}
                    isDisabled={isAddKnowledgeButtonDisabled}
                    variant="primary"
                >
                    Create content
                </Button>
            </>
        )
    }

    switch (data.type) {
        case KnowledgeType.Domain:
            return (
                <>
                    <Button
                        id={syncButtonId}
                        onClick={onSync}
                        isDisabled={isSyncButtonDisabled}
                        variant="secondary"
                        leadingSlot="arrows-reload-alt-1"
                    >
                        Sync store website
                    </Button>
                    {syncTooltipMessage && (
                        <Tooltip target={syncButtonId}>
                            {syncTooltipMessage}
                        </Tooltip>
                    )}
                </>
            )
        case KnowledgeType.URL:
            return (
                <>
                    <Button
                        id={syncButtonId}
                        onClick={onSync}
                        isDisabled={isSyncButtonDisabled}
                        variant="secondary"
                        leadingSlot="arrows-reload-alt-1"
                    >
                        Sync URL
                    </Button>
                    {syncTooltipMessage && (
                        <Tooltip target={syncButtonId}>
                            {syncTooltipMessage}
                        </Tooltip>
                    )}
                    <Button
                        onClick={onDelete}
                        isDisabled={isDeleteButtonDisabled}
                        aria-label="Delete URL"
                        variant="secondary"
                        intent="destructive"
                        icon="trash-empty"
                    />
                </>
            )
        case KnowledgeType.Document:
            return (
                <Button
                    onClick={onDelete}
                    isDisabled={isDeleteButtonDisabled}
                    aria-label="Delete document"
                    variant="secondary"
                    intent="destructive"
                    icon="trash-empty"
                />
            )
    }

    return null
}
