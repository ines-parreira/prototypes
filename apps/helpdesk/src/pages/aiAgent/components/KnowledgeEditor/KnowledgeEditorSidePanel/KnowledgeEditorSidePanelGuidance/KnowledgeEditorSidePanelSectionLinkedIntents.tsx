import { useState } from 'react'
import type { ReactNode } from 'react'

import {
    Button,
    Icon,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { useLinkedIntentsSidebar } from './hooks/useLinkedIntentsSidebar'
import { KnowledgeEditorSidePanelSectionLinkedIntentsTooltip } from './KnowledgeEditorSidePanelSectionLinkedIntentsTooltip'
import { KnowledgeEditorSidePanelSectionLinkedIntentsModal } from './modals/KnowledgeEditorSidePanelSectionLinkedIntentsModal'
import { KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal } from './modals/KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal'

import css from './KnowledgeEditorSidePanelSectionLinkedIntents.less'

type Props = {
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionLinkedIntents = ({
    sectionId,
}: Props) => {
    const {
        guidanceIntentIds,
        linkIntentsDisabledTooltip,
        isLinkIntentsButtonDisabled,
        canUnlinkIntentsFromSidebar,
        isUpdating,
        getLinkedIntentLabelById,
    } = useLinkedIntentsSidebar()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [intentPendingUnlink, setIntentPendingUnlink] = useState<
        string | null
    >(null)

    const linkIntentsButton = (
        <Button
            variant="secondary"
            size="sm"
            leadingSlot={<Icon name="add-plus" />}
            onClick={() => setIsModalOpen(true)}
            isDisabled={isLinkIntentsButtonDisabled}
            isLoading={intentPendingUnlink !== null && isUpdating}
        >
            Link intents
        </Button>
    )

    const linkIntentsButtonWithTooltip: ReactNode =
        linkIntentsDisabledTooltip ? (
            <Tooltip placement="top">
                <TooltipTrigger>
                    <span className={css.linkIntentsButtonWrapper} tabIndex={0}>
                        {linkIntentsButton}
                    </span>
                </TooltipTrigger>
                <TooltipContent>{linkIntentsDisabledTooltip}</TooltipContent>
            </Tooltip>
        ) : (
            linkIntentsButton
        )

    return (
        <>
            <KnowledgeEditorSidePanelSection
                header={{
                    title: 'Linked intents',
                    subtitle:
                        'When intents are linked, AI Agent will prioritize this guidance to respond to these intents.',
                    subtitleAlign: 'left',
                    tooltip: (
                        <KnowledgeEditorSidePanelSectionLinkedIntentsTooltip />
                    ),
                }}
                sectionId={sectionId}
            >
                {guidanceIntentIds.length > 0 ? (
                    <div className={css.linkedIntentsContent}>
                        <div className={css.linkedIntentsList}>
                            {guidanceIntentIds.map((intentId) => (
                                <Tag
                                    key={intentId}
                                    leadingSlot="link-horizontal"
                                    onClose={
                                        canUnlinkIntentsFromSidebar
                                            ? () =>
                                                  setIntentPendingUnlink(
                                                      intentId,
                                                  )
                                            : undefined
                                    }
                                >
                                    {getLinkedIntentLabelById(intentId)}
                                </Tag>
                            ))}
                        </div>
                        {linkIntentsButtonWithTooltip}
                    </div>
                ) : (
                    <div className={css.emptyState}>
                        <Text size="sm" className={css.emptyStateText}>
                            No intents linked
                        </Text>
                        {linkIntentsButtonWithTooltip}
                    </div>
                )}
            </KnowledgeEditorSidePanelSection>

            {isModalOpen && (
                <KnowledgeEditorSidePanelSectionLinkedIntentsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal
                intentId={intentPendingUnlink}
                onClose={() => setIntentPendingUnlink(null)}
            />
        </>
    )
}
