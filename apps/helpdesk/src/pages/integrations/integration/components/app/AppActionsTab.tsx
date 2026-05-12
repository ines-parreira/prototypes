import { useMemo, useState } from 'react'

import { Box, Button, Card, Heading, Text } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import {
    aiAgentRoutes,
    getAiAgentNavigationRoutes,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import Loader from 'pages/common/components/Loader/Loader'

import AppActionsStepsTable from './AppActionsStepsTable'

const LEARN_MORE_URL =
    'https://docs.gorgias.com/en-US/articles/connect-ai-agent-with-other-apps-184201'

type Props = {
    appId: string
    appName: string
    appIcon?: string
}

export default function AppActionsTab({ appId, appName, appIcon }: Props) {
    const shopifyIntegrations = useStoreIntegrations([IntegrationType.Shopify])
    const firstShopName = shopifyIntegrations[0]
        ? getShopNameFromStoreIntegration(shopifyIntegrations[0])
        : null

    const goToActionsHref = firstShopName
        ? getAiAgentNavigationRoutes(firstShopName).actions
        : aiAgentRoutes.actionsPlatform

    const [isBannerDismissed, setIsBannerDismissed] = useState(false)

    const { data: templates = [], isInitialLoading } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['reusable-llm-prompt'],
        })

    const appActionSteps = useMemo(() => {
        const matchedById = new Map<string, (typeof templates)[number]>()
        for (const template of templates) {
            if (matchedById.has(template.id)) continue
            const isMatch = template.apps.some(
                (app) =>
                    (app.type === 'app' && app.app_id === appId) ||
                    app.type === appId,
            )
            if (isMatch) matchedById.set(template.id, template)
        }
        return Array.from(matchedById.values())
    }, [templates, appId])

    return (
        <Box flexDirection="column" gap="md" padding="lg">
            {!isBannerDismissed && (
                <Card
                    elevation="mid"
                    flexDirection="column"
                    gap="md"
                    padding="lg"
                >
                    <Box flexDirection="column" gap="xxs">
                        <Box justifyContent="space-between" alignItems="center">
                            <Heading size="lg">
                                Gorgias &lt;&gt; {appName} actions
                            </Heading>
                            <Button
                                icon="close"
                                variant="tertiary"
                                size="sm"
                                onClick={() => setIsBannerDismissed(true)}
                                aria-label="Dismiss"
                            />
                        </Box>
                        <Text>
                            Use actions to automate workflows that normally
                            require manual changes in third-party tools, such as
                            update, cancel, or modify customer orders and
                            information like billing and shipping details,
                            tracking and status updates, and more. AI and human
                            agents can perform actions in conversations with
                            customers.
                        </Text>
                    </Box>
                    <Box gap="xs">
                        <Button as="a" href={goToActionsHref} size="md">
                            Go to actions
                        </Button>
                        <Button
                            as="a"
                            href={LEARN_MORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="tertiary"
                            size="md"
                        >
                            Learn more
                        </Button>
                    </Box>
                </Card>
            )}

            {isInitialLoading ? (
                <Loader
                    minHeight="200px"
                    role="progressbar"
                    aria-label="Loading actions"
                />
            ) : appActionSteps.length === 0 ? (
                <Box
                    flexDirection="column"
                    alignItems="center"
                    gap="sm"
                    padding="lg"
                >
                    <Heading size="md">No actions for this app</Heading>
                    <Text>
                        There are no AI Agent action steps available for this
                        app yet.
                    </Text>
                </Box>
            ) : (
                <AppActionsStepsTable
                    steps={appActionSteps}
                    appIcon={appIcon}
                />
            )}
        </Box>
    )
}
