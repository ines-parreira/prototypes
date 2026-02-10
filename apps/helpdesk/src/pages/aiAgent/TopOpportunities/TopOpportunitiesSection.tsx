import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router'

import { Box, Button, Card, Heading, Skeleton, Text } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'

import { OpportunityType } from '../opportunities/enums'
import { useKnowledgeServiceOpportunities } from '../opportunities/hooks/useKnowledgeServiceOpportunities'
import { TopOpportunityCard } from './TopOpportunitiesCard'

import css from './TopOpportunitiesSection.less'

const TOP_OPPORTUNITIES_LIMIT = 3

interface TopOpportunitiesSectionProps {
    shopName: string
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
}: TopOpportunitiesSectionProps) => {
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const isTopOpportunitiesEnabled = useFlag(
        FeatureFlagKey.IncreaseVisibilityOfOpportunity,
        false,
    )
    const shopIntegrationId = useShopIntegrationId(shopName)
    const { opportunities, isLoading } = useKnowledgeServiceOpportunities(
        shopIntegrationId ?? 0,
        !!shopIntegrationId && !!isTopOpportunitiesEnabled,
        TOP_OPPORTUNITIES_LIMIT,
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
                <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                        history.push(routes.opportunities)
                    }}
                >
                    View all opportunities
                </Button>
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
                        />
                    ))}
                </Box>
            ) : (
                <TopOpportunitiesEmptyState />
            )}
        </Card>
    )
}
