import { useState } from 'react'
import type { ReactNode } from 'react'

import {
    Box,
    Button,
    Icon,
    Quantity,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

import { useLinkedIntentsSidebarSkill } from './hooks/useLinkedIntentsSidebarSkill'
import { SkillLinkedIntentsModal } from './modals/SkillLinkedIntentsModal'
import { SkillUnlinkIntentModal } from './modals/SkillUnlinkIntentModal'

import css from './SkillEditorSidePanelIntentsSection.less'

type Props = {
    sectionId: string
}

function getIntentDiffColor(diffStatus: 'added' | 'removed' | null) {
    if (diffStatus === 'added') {
        return 'green'
    }

    if (diffStatus === 'removed') {
        return 'red'
    }

    return 'grey'
}

export const SkillEditorSidePanelIntentsSection = ({ sectionId }: Props) => {
    const {
        displayedIntentIds,
        intentDiffParts,
        isDiffMode,
        linkIntentsDisabledTooltip,
        isLinkIntentsButtonDisabled,
        canUnlinkIntentsFromSidebar,
        isUpdating,
        getLinkedIntentLabelById,
    } = useLinkedIntentsSidebarSkill()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [intentPendingUnlink, setIntentPendingUnlink] = useState<
        string | null
    >(null)
    const items = isDiffMode
        ? intentDiffParts
        : displayedIntentIds.map((intentId) => ({
              intentId,
              diffStatus: null,
          }))

    const linkIntentsButton = (
        <Button
            variant="tertiary"
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
            <Tooltip
                placement="top"
                trigger={
                    <span className={css.linkIntentsButtonWrapper} tabIndex={0}>
                        {linkIntentsButton}
                    </span>
                }
            >
                <TooltipContent>{linkIntentsDisabledTooltip}</TooltipContent>
            </Tooltip>
        ) : (
            linkIntentsButton
        )

    const intentsCount = displayedIntentIds.length

    const sectionTitle = (
        <Box flexDirection="row" alignItems="center" gap="xxs">
            <Text size="md" variant="bold">
                Intents
            </Text>
            <Quantity quantity={intentsCount} />
        </Box>
    )

    return (
        <>
            <KnowledgeEditorSidePanelSection
                header={{
                    title: sectionTitle,
                    subtitle: (
                        <Text size="sm" color="content-neutral-tertiary">
                            When AI Agent detects one of these intents in a
                            conversation, this skill takes over.
                        </Text>
                    ),
                }}
                sectionId={sectionId}
                alwaysExpanded
            >
                <div className={css.linkedIntentsContent}>
                    {items.length > 0 && (
                        <div className={css.linkedIntentsList}>
                            {items.map(({ intentId, diffStatus }) => (
                                <Tag
                                    key={`${intentId}-${diffStatus ?? 'unchanged'}`}
                                    color={
                                        diffStatus
                                            ? getIntentDiffColor(diffStatus)
                                            : undefined
                                    }
                                    onClose={
                                        !isDiffMode &&
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
                    )}
                    {!isDiffMode && linkIntentsButtonWithTooltip}
                </div>
            </KnowledgeEditorSidePanelSection>

            {isModalOpen && (
                <SkillLinkedIntentsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {intentPendingUnlink !== null && (
                <SkillUnlinkIntentModal
                    intentId={intentPendingUnlink}
                    onClose={() => setIntentPendingUnlink(null)}
                />
            )}
        </>
    )
}
