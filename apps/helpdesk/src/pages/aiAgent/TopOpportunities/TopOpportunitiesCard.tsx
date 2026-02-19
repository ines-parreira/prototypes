import { useCallback, useState } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router'

import {
    Box,
    Button,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

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
    isRestricted: boolean
    totalRestrictedOpportunities?: number
}

export const TopOpportunityCard = ({
    opportunity,
    shopName,
    shopIntegrationId,
    isTopOpportunitiesEnabled,
    isRestricted,
    totalRestrictedOpportunities,
}: TopOpportunityCardProps) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const [isHovered, setIsHovered] = useState(false)
    const [isTicketDrillDownModalOpen, setIsTicketDrillDownModalOpen] =
        useState(false)

    const { data: opportunityDetails } = useEnrichedOpportunity(
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
    const isKnowledgeGap =
        opportunity.type === OpportunityType.FILL_KNOWLEDGE_GAP

    const handleCardClick = () => {
        history.push(
            !!opportunity.id
                ? routes.opportunitiesWithId(opportunity.id)
                : routes.opportunities,
        )
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
                    title: `Resolve conflicting knowledge: "${opportunity.insight}"`,
                    buttonText: 'Resolve conflict',
                    ticketCountText: (
                        <Text variant="regular" size="sm">
                            This conflict is impacting{' '}
                            <span
                                className={classNames(css.handoverTickets, {
                                    [css.restricted]: isRestricted,
                                })}
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
                                className={classNames(css.handoverTickets, {
                                    [css.restricted]: isRestricted,
                                })}
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

    const cardContent = (
        <div
            className={classNames(css.card, {
                [css.knowledgeGap]: isKnowledgeGap,
                [css.restricted]: isRestricted,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box width="100%" display="flex" flexDirection="column">
                <Text variant="bold" size="sm">
                    {cardDetail.title}
                </Text>
                {cardDetail.ticketCountText}
            </Box>

            <Button size="sm" onClick={handleCardClick}>
                {isRestricted ? 'Upgrade plan' : cardDetail.buttonText}
            </Button>
        </div>
    )

    return (
        <>
            {isRestricted ? (
                <Tooltip placement="top" isOpen={isHovered}>
                    <TooltipTrigger>{cardContent}</TooltipTrigger>
                    <TooltipContent>
                        Upgrade to access {totalRestrictedOpportunities} more
                        <br />
                        opportunities for AI Agent
                    </TooltipContent>
                </Tooltip>
            ) : (
                cardContent
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
