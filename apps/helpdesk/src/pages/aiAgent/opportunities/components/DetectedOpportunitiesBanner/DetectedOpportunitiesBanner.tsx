import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { Box, Button, Card, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { OpportunityTicketDrillDownModal } from 'pages/aiAgent/opportunities/components/OpportunityTicketDrillDownModal'
import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import { useFindTopOpportunityByTicketId } from 'pages/aiAgent/opportunities/hooks/useFindTopOpportunityByTicketId'
import { useOpportunitiesTracking } from 'pages/aiAgent/opportunities/hooks/useOpportunitiesTracking'
import { OpportunityPageReferrer } from 'pages/aiAgent/opportunities/types'

import css from './DetectedOpportunitiesBanner.less'

interface DetectedOpportunitiesBannerProps {
    shopName: string
    shopIntegrationId?: number
    ticketId: number
    isTopOpportunitiesEnabled: boolean
}

export const DetectedOpportunitiesBanner = ({
    shopName,
    shopIntegrationId,
    ticketId,
    isTopOpportunitiesEnabled,
}: DetectedOpportunitiesBannerProps) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)

    const { topOpportunity } = useFindTopOpportunityByTicketId(
        shopIntegrationId ?? 0,
        ticketId ? ticketId.toString() : '',
        {
            query: {
                enabled:
                    !!shopIntegrationId &&
                    !!ticketId &&
                    !!isTopOpportunitiesEnabled,
                refetchOnWindowFocus: false,
            },
        },
    )

    const { onRedirectToOpportunityPage } = useOpportunitiesTracking()

    const ticketCount = topOpportunity?.ticketCount ?? 0
    const resources = topOpportunity?.resources ?? []
    const isKnowledgeGap =
        topOpportunity?.type === OpportunityType.FILL_KNOWLEDGE_GAP

    const handleCardClick = () => {
        const url = routes.opportunitiesWithId(topOpportunity?.id)
        window.open(url, '_blank', 'noopener,noreferrer')

        onRedirectToOpportunityPage({
            referrer: OpportunityPageReferrer.IN_TICKET_FEEDBACK_TAB,
        })
    }

    const handleTicketCountClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (
            topOpportunity?.detectionObjectIds &&
            topOpportunity?.detectionObjectIds.length > 0
        ) {
            setIsTicketDrillDownModalOpen(true)
        } else {
            console.warn(
                'No detectionObjectIds available for opportunity:',
                topOpportunity,
            )
        }
    }

    const handleCloseTicketDrillDownModal = useCallback(() => {
        setIsTicketDrillDownModalOpen(false)
    }, [])

    if (!topOpportunity) return null

    const getCardDetail = () => {
        switch (topOpportunity.type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    title: `Resolve conflicting knowledge: "${resources[0]?.insight}" and "${resources[1]?.insight}"`,
                    buttonText: 'Resolve conflict',
                    ticketCountText: (
                        <Text variant="regular" size="sm">
                            This conflict is impacting{' '}
                            <span
                                className={css.handoverTickets}
                                onClick={handleTicketCountClick}
                            >
                                {ticketCount}
                                {ticketCount === 1 ? ' ticket' : ' tickets'}
                            </span>
                        </Text>
                    ),
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    title: `Review AI-generated guidance:  "${topOpportunity.insight}"`,
                    buttonText: 'Review guidance',
                    ticketCountText: (
                        <Text variant="regular" size="sm">
                            Based on{' '}
                            <span
                                className={css.handoverTickets}
                                onClick={handleTicketCountClick}
                            >
                                {ticketCount}
                                {ticketCount === 1 ? ' ticket' : ' tickets'}
                            </span>{' '}
                            AI Agent could not resolve
                        </Text>
                    ),
                }
        }
    }

    const cardDetail = getCardDetail()

    return (
        <>
            <Card
                width="100%"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="flex-start"
                gap="sm"
                className={classNames(css.card, {
                    [css.knowledgeGap]: isKnowledgeGap,
                })}
            >
                <Box width="100%" display="flex" flexDirection="column">
                    <Text variant="bold" size="sm">
                        {cardDetail.title}
                    </Text>
                    {cardDetail.ticketCountText}
                </Box>

                <Button
                    size="sm"
                    onClick={handleCardClick}
                    trailingSlot="external-link"
                >
                    {cardDetail.buttonText}
                </Button>
            </Card>
            {isTicketDrillDownModalOpen && (
                <OpportunityTicketDrillDownModal
                    isOpen={isTicketDrillDownModalOpen}
                    onClose={handleCloseTicketDrillDownModal}
                    ticketIds={topOpportunity?.detectionObjectIds ?? []}
                />
            )}
        </>
    )
}
