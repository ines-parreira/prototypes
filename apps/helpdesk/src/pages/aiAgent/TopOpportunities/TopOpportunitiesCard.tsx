import { useCallback, useState } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router'

import { Box, Button, Card, Skeleton, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { OpportunityTicketDrillDownModal } from 'pages/aiAgent/opportunities/components/OpportunityTicketDrillDownModal'
import { useEnrichedOpportunity } from 'pages/aiAgent/opportunities/hooks/useEnrichedOpportunity'

import { OpportunityType } from '../opportunities/enums'
import type { OpportunityListItem } from '../opportunities/types'

import css from './TopOpportunitiesCard.less'

interface TopOpportunityCardProps {
    opportunity: OpportunityListItem
    shopName: string
    shopIntegrationId?: number
    isTopOpportunitiesEnabled: boolean
}

export const TopOpportunityCard = ({
    opportunity,
    shopName,
    shopIntegrationId,
    isTopOpportunitiesEnabled,
}: TopOpportunityCardProps) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)

    const { data: opportunityDetails, isLoading: isDetailLoading } =
        useEnrichedOpportunity(
            shopIntegrationId ?? 0,
            parseInt(opportunity.id, 10),
            {
                query: {
                    enabled: !!shopIntegrationId && !!isTopOpportunitiesEnabled,
                    refetchOnWindowFocus: false,
                },
            },
        )

    const ticketCount = opportunity.ticketCount ?? 0
    const resources = opportunityDetails?.resources ?? []
    const isKnowledgeGap =
        opportunity.type === OpportunityType.FILL_KNOWLEDGE_GAP

    const handleCardClick = () => {
        history.push(routes.opportunitiesWithId(opportunity.id))
    }

    const handleTicketCountClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (
            opportunityDetails?.detectionObjectIds &&
            opportunityDetails.detectionObjectIds.length > 0
        ) {
            setIsTicketDrillDownModalOpen(true)
        } else {
            console.warn(
                'No detectionObjectIds available for opportunity:',
                opportunityDetails,
            )
        }
    }

    const handleCloseTicketDrillDownModal = useCallback(() => {
        setIsTicketDrillDownModalOpen(false)
    }, [])

    const getCardDetail = () => {
        switch (opportunity.type) {
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
                    title: `Review AI-generated guidance:  "${opportunity.insight}"`,
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
            {!isKnowledgeGap && isDetailLoading ? (
                <Card
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    width="100%"
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap="xxs"
                        flex={1}
                        width="100%"
                    >
                        <Skeleton width="100%" height="16px" />
                        <Skeleton width="100%" height="16px" />
                        <Skeleton width="115px" height="24px" />
                    </Box>
                </Card>
            ) : (
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

                    <Button size="sm" onClick={handleCardClick}>
                        {cardDetail.buttonText}
                    </Button>
                </Card>
            )}
            {isTicketDrillDownModalOpen && (
                <OpportunityTicketDrillDownModal
                    isOpen={isTicketDrillDownModalOpen}
                    onClose={handleCloseTicketDrillDownModal}
                    ticketIds={opportunityDetails?.detectionObjectIds ?? []}
                />
            )}
        </>
    )
}
