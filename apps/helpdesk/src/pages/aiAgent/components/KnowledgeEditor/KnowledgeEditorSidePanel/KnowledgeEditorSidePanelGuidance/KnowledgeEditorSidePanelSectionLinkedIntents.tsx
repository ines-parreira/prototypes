import { useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    Button,
    Icon,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'

import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import {
    KnowledgeEditorSidePanelSectionLinkedIntentsModal,
    type LinkedIntent,
} from './KnowledgeEditorSidePanelSectionLinkedIntentsModal'
import { KnowledgeEditorSidePanelSectionLinkedIntentsTooltip } from './KnowledgeEditorSidePanelSectionLinkedIntentsTooltip'
import { KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal } from './KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal'

import css from './KnowledgeEditorSidePanelSectionLinkedIntents.less'

type Props = {
    sectionId: string
}

const LINK_INTENTS_UNPUBLISHED_TOOLTIP =
    'Intents can only be linked when guidance is published and enabled for AI Agent.'
const LINK_INTENTS_DRAFT_WITH_PUBLISHED_TOOLTIP =
    "These intents are currently linked to the published version of this guidance. You'll be able to add more once this draft is published."

export const KnowledgeEditorSidePanelSectionLinkedIntents = ({
    sectionId,
}: Props) => {
    const {
        guidanceIsCurrent,
        publishedVersionId,
        historicalPublishedDatetime,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceIsCurrent: storeState.state.guidance?.isCurrent,
            publishedVersionId: storeState.state.guidance?.publishedVersionId,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
        })),
    )
    const [isLinkedIntentsModalOpen, setIsLinkedIntentsModalOpen] =
        useState(false)
    const [linkedIntents, setLinkedIntents] = useState<LinkedIntent[]>([])
    const [intentPendingUnlink, setIntentPendingUnlink] =
        useState<LinkedIntent | null>(null)

    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined
    const hasPublishedVersion =
        publishedVersionId !== null && publishedVersionId !== undefined
    const isViewingDraft = guidanceIsCurrent === false

    const linkIntentsDisabledTooltip = !hasPublishedVersion
        ? LINK_INTENTS_UNPUBLISHED_TOOLTIP
        : isViewingDraft
          ? LINK_INTENTS_DRAFT_WITH_PUBLISHED_TOOLTIP
          : undefined

    const isLinkIntentsButtonDisabled = linkIntentsDisabledTooltip !== undefined
    const canUnlinkIntentsFromSidebar =
        !isViewingHistoricalVersion && !isLinkIntentsButtonDisabled

    const handleCloseModal = () => {
        setIsLinkedIntentsModalOpen(false)
    }

    const handleSaveLinkedIntents = (nextLinkedIntents: LinkedIntent[]) => {
        setLinkedIntents(nextLinkedIntents)
        setIsLinkedIntentsModalOpen(false)
    }

    const handleUnlinkIntentRequest = (intent: LinkedIntent) => {
        setIntentPendingUnlink(intent)
    }

    const handleCloseUnlinkIntentModal = () => {
        setIntentPendingUnlink(null)
    }

    const handleConfirmUnlinkIntent = () => {
        if (!intentPendingUnlink) {
            return
        }

        setLinkedIntents((previousLinkedIntents) =>
            previousLinkedIntents.filter(
                ({ intent }) => intent !== intentPendingUnlink.intent,
            ),
        )
        setIntentPendingUnlink(null)
    }

    const linkIntentsButton = !isViewingHistoricalVersion ? (
        <Button
            variant="secondary"
            size="sm"
            leadingSlot={<Icon name="add-plus" />}
            onClick={() => setIsLinkedIntentsModalOpen(true)}
            isDisabled={isLinkIntentsButtonDisabled}
        >
            Link intents
        </Button>
    ) : null

    const linkIntentsButtonWithTooltip =
        linkIntentsButton && linkIntentsDisabledTooltip ? (
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
                {linkedIntents.length > 0 ? (
                    <div className={css.linkedIntentsContent}>
                        <div className={css.linkedIntentsList}>
                            {linkedIntents.map((intent) => (
                                <Tag
                                    key={intent.intent}
                                    leadingSlot="link-horizontal"
                                    onClose={
                                        canUnlinkIntentsFromSidebar
                                            ? () =>
                                                  handleUnlinkIntentRequest(
                                                      intent,
                                                  )
                                            : undefined
                                    }
                                >
                                    {intent.groupName}/{intent.name}
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

            <KnowledgeEditorSidePanelSectionLinkedIntentsModal
                isOpen={isLinkedIntentsModalOpen}
                selectedIntentIds={linkedIntents.map(({ intent }) => intent)}
                onClose={handleCloseModal}
                onSave={handleSaveLinkedIntents}
            />
            <KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal
                isOpen={intentPendingUnlink !== null}
                onClose={handleCloseUnlinkIntentModal}
                onUnlink={handleConfirmUnlinkIntent}
            />
        </>
    )
}
