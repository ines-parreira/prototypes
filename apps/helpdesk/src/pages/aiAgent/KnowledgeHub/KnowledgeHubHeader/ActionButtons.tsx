import {
    Button,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

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
                    {syncTooltipMessage ? (
                        <Tooltip placement="top">
                            <TooltipTrigger>
                                <Button
                                    onClick={onSync}
                                    isDisabled={isSyncButtonDisabled}
                                    variant="secondary"
                                    leadingSlot="arrows-reload-alt-1"
                                >
                                    Sync store website
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <Text size="sm">{syncTooltipMessage}</Text>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={onSync}
                            isDisabled={isSyncButtonDisabled}
                            variant="secondary"
                            leadingSlot="arrows-reload-alt-1"
                        >
                            Sync store website
                        </Button>
                    )}
                </>
            )
        case KnowledgeType.URL:
            return (
                <>
                    {syncTooltipMessage ? (
                        <Tooltip placement="top">
                            <TooltipTrigger>
                                <Button
                                    onClick={onSync}
                                    isDisabled={isSyncButtonDisabled}
                                    variant="secondary"
                                    leadingSlot="arrows-reload-alt-1"
                                >
                                    Sync URL
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <Text size="sm">{syncTooltipMessage}</Text>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={onSync}
                            isDisabled={isSyncButtonDisabled}
                            variant="secondary"
                            leadingSlot="arrows-reload-alt-1"
                        >
                            Sync URL
                        </Button>
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
