import { useState } from 'react'
import type { ReactNode } from 'react'

import {
    Banner,
    Box,
    Button,
    Icon,
    Quantity,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

import { useLinkedIntentsSidebarSkill } from './hooks/useLinkedIntentsSidebarSkill'
import { SkillLinkedIntentsModal } from './modals/SkillLinkedIntentsModal'
import { SkillUnlinkIntentModal } from './modals/SkillUnlinkIntentModal'
import { SkillIntentTag } from './SkillIntentTag'

import css from './SkillEditorSidePanelIntentsSection.less'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelIntentsSection = ({ sectionId }: Props) => {
    const {
        items,
        showBanner,
        showLinkButton,
        linkButton,
        intentsCount,
        isPreview,
    } = useLinkedIntentsSidebarSkill()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [intentPendingUnlink, setIntentPendingUnlink] = useState<
        string | null
    >(null)

    const linkIntentsButton = (
        <Button
            variant="tertiary"
            size="sm"
            leadingSlot={<Icon name="add-plus" />}
            onClick={() => setIsModalOpen(true)}
            isDisabled={linkButton.isDisabled}
            isLoading={intentPendingUnlink !== null && linkButton.isUpdating}
        >
            Link intents
        </Button>
    )

    const linkIntentsButtonWithTooltip: ReactNode =
        linkButton.disabledTooltip ? (
            <Tooltip
                placement="top"
                trigger={
                    <span className={css.linkIntentsButtonWrapper} tabIndex={0}>
                        {linkIntentsButton}
                    </span>
                }
            >
                <TooltipContent>{linkButton.disabledTooltip}</TooltipContent>
            </Tooltip>
        ) : (
            linkIntentsButton
        )

    const sectionTitle = (
        <Box flexDirection="row" alignItems="center" gap="xxs">
            <Text size="md" variant="bold">
                Intents
            </Text>
            <Text size="md" color="content-error-default">
                *
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
                alwaysExpanded={!isPreview}
            >
                <div className={css.linkedIntentsContent}>
                    {showBanner && (
                        <div className={css.banner}>
                            <Banner
                                intent="warning"
                                size="sm"
                                isClosable={false}
                                icon={false}
                            >
                                {/* margin: -8px is to remove the empty gap from
                                Axiom component */}
                                <Box
                                    marginTop={-8}
                                    display="flex"
                                    flexDirection="column"
                                >
                                    <Text variant="bold" size="sm">
                                        Some intents below are used in other
                                        skills
                                    </Text>
                                    <Text size="sm">
                                        Publish this skill to reassign them to
                                        this one
                                    </Text>
                                </Box>
                            </Banner>
                        </div>
                    )}
                    {items.length > 0 && (
                        <div className={css.linkedIntentsList}>
                            {items.map((item) => (
                                <SkillIntentTag
                                    key={item.intentId}
                                    {...item}
                                    onClose={
                                        showLinkButton && linkButton.canUnlink
                                            ? () =>
                                                  setIntentPendingUnlink(
                                                      item.intentId,
                                                  )
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                    {showLinkButton && linkIntentsButtonWithTooltip}
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
