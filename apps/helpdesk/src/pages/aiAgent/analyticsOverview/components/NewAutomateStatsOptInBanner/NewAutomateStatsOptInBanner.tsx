import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Banner, Box, Button, Link, Text } from '@gorgias/axiom'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

export function NewAutomateStatsOptInBanner() {
    const { hasAccess, isLoading } = useAiAgentAccess()
    const {
        value: isAnalyticsDashboardsNewScreensEnabled,
        isLoading: isFlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)

    if (!hasAccess || isLoading || isFlagLoading) {
        return null
    }

    if (isAnalyticsDashboardsNewScreensEnabled) {
        return (
            <Banner
                isClosable={false}
                intent="ai"
                icon="ai-alt-1"
                variant="fullWidth"
                description={
                    <Box
                        display="flex"
                        gap="xxs"
                        flexWrap="nowrap"
                        style={{ textWrap: 'wrap' }}
                    >
                        <div>
                            <Text variant="bold">
                                Discover the new AI and Automation analytics
                                experience.
                            </Text>{' '}
                            <Text>
                                Watch{' '}
                                <Link
                                    href={
                                        'https://www.loom.com/share/81c4820e8d8c4e769d1a095701377da3'
                                    }
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    trailingSlot="external-link"
                                >
                                    the demo
                                </Link>{' '}
                                for more details.
                            </Text>
                        </div>
                    </Box>
                }
            >
                <Button
                    as={Link}
                    href="/app/stats/analytics-overview"
                    variant="secondary"
                >
                    Go to dashboard
                </Button>
            </Banner>
        )
    }

    return (
        <Banner
            isClosable={false}
            intent="ai"
            icon="ai-alt-1"
            variant="fullWidth"
            description={
                <Box
                    display="flex"
                    gap="xxs"
                    flexWrap="nowrap"
                    style={{ textWrap: 'wrap' }}
                >
                    <div>
                        <Text variant="bold">
                            Opt in now for early access to the new AI Agent
                            analytics experience.
                        </Text>{' '}
                        <Text>
                            Rolling out gradually from May 26 to June 2. Watch{' '}
                            <Link
                                href={
                                    'https://www.loom.com/share/81c4820e8d8c4e769d1a095701377da3'
                                }
                                rel="noopener noreferrer"
                                target="_blank"
                                trailingSlot="external-link"
                            >
                                the demo
                            </Link>{' '}
                            for more details.
                        </Text>
                    </div>
                </Box>
            }
        >
            <Button
                as="a"
                href="https://gorgias.typeform.com/to/XcW7zCSm"
                rel="noopener noreferrer"
                target="_blank"
                variant="secondary"
                onClick={() => {
                    logEvent(
                        SegmentEvent.AnalyticsNewAutomateStatsOptInRequested,
                    )
                }}
            >
                Opt in to early access
            </Button>
        </Banner>
    )
}
