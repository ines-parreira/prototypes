import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router'

import { Box, Button, Card, Heading, Skeleton, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import type { OpportunityListItem } from 'pages/aiAgent/opportunities/types'

import { OpportunityType } from '../opportunities/enums'
import { TOP_OPPORTUNITIES_LIMIT } from './constants'
import { TopOpportunityCard } from './TopOpportunitiesCard'

import css from './TopOpportunitiesSection.less'

interface TopOpportunitiesSectionProps {
    shopName: string
    shopIntegrationId?: number
    opportunities: OpportunityListItem[]
    isLoading: boolean
    totalCount: number
    allowedOpportunityIds?: number[]
}

const TopOpportunitiesCardSkeleton = () => {
    return (
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
                <Skeleton width="100%" height="14px" />
                <Skeleton width="115px" height="24px" />
            </Box>
        </Card>
    )
}

const TopOpportunitiesEmptyState = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="xl"
            marginBottom="lg"
        >
            <Text variant="bold" size="md">
                No opportunities available
            </Text>
            <Text size="sm" align="center">
                AI Agent is learning from your conversations.
            </Text>
        </Box>
    )
}

export const TopOpportunitiesSection = ({
    shopName,
    shopIntegrationId,
    opportunities,
    isLoading,
    totalCount,
    allowedOpportunityIds,
}: TopOpportunitiesSectionProps) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })
    const isTopOpportunitiesEnabled = useFlag(
        FeatureFlagKey.IncreaseVisibilityOfOpportunity,
        false,
    )

    // Sort opportunities: RESOLVE_CONFLICT first, then by ticket count (descending)
    const sortedOpportunities = useMemo(() => {
        return [...opportunities].sort((a, b) => {
            if (
                a.type === OpportunityType.RESOLVE_CONFLICT &&
                b.type !== OpportunityType.RESOLVE_CONFLICT
            ) {
                return -1
            }
            if (
                a.type !== OpportunityType.RESOLVE_CONFLICT &&
                b.type === OpportunityType.RESOLVE_CONFLICT
            ) {
                return 1
            }
            const ticketCountA = a.ticketCount ?? 0
            const ticketCountB = b.ticketCount ?? 0
            return ticketCountB - ticketCountA
        })
    }, [opportunities])

    const hasOpportunities = sortedOpportunities.length > 0

    const isOpportunityRestricted = useCallback(
        (opportunityId: string) => {
            if (allowedOpportunityIds === undefined) {
                return false
            }
            return !allowedOpportunityIds.includes(Number(opportunityId))
        },
        [allowedOpportunityIds],
    )

    const totalRestrictedOpportunities = useMemo(() => {
        if (allowedOpportunityIds === undefined) return

        return totalCount - allowedOpportunityIds.length
    }, [totalCount, allowedOpportunityIds])

    const displayViewAllOpportunitiesButton = useMemo(() => {
        return totalCount > TOP_OPPORTUNITIES_LIMIT
    }, [totalCount])

    return (
        <Card
            width="100%"
            display="flex"
            flexDirection="column"
            gap="lg"
            padding="lg"
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Heading size="md">Top opportunities</Heading>
                {displayViewAllOpportunitiesButton && (
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                            history.push(routes.opportunities)
                        }}
                    >
                        View all opportunities
                    </Button>
                )}
            </Box>
            {isLoading ? (
                <Box display="flex" flexDirection="row" gap="md" width="100%">
                    {[...Array(3)].map((_, index) => (
                        <TopOpportunitiesCardSkeleton key={index} />
                    ))}
                </Box>
            ) : hasOpportunities ? (
                <Box className={css.gridContainer} gap="md" width="100%">
                    {sortedOpportunities.map((opportunity) => (
                        <TopOpportunityCard
                            key={opportunity.id}
                            opportunity={opportunity}
                            shopName={shopName}
                            shopIntegrationId={shopIntegrationId}
                            isTopOpportunitiesEnabled={
                                isTopOpportunitiesEnabled
                            }
                            isRestricted={isOpportunityRestricted(
                                opportunity.id,
                            )}
                            totalRestrictedOpportunities={
                                totalRestrictedOpportunities
                            }
                        />
                    ))}
                </Box>
            ) : (
                <TopOpportunitiesEmptyState />
            )}
        </Card>
    )
}
