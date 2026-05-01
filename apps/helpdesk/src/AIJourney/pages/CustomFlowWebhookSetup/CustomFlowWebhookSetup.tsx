import { useHistory } from 'react-router-dom'

import { Box, Button, Loader, PanelHeader, Text } from '@gorgias/axiom'

import { KlaviyoSetupCard } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'

export const CustomFlowWebhookSetup = () => {
    const { journeyData, isLoadingJourneyData, isErrorJourneyData, shopName } =
        useJourneyContext()
    const history = useHistory()

    if (isLoadingJourneyData) {
        return <Loader aria-label="Loading custom flow" />
    }

    if (!journeyData) {
        return (
            <Box flexDirection="column" padding="lg" gap="lg">
                <Text>
                    {isErrorJourneyData
                        ? 'This flow could not be loaded. Please refresh the page or go back and try again.'
                        : 'This flow could not be found. It may not have been created yet.'}
                </Text>
                <Box justifyContent="flex-end">
                    <Button
                        variant="secondary"
                        onClick={() =>
                            history.push(`/app/ai-journey/${shopName}/flows`)
                        }
                    >
                        Go to flows
                    </Button>
                </Box>
            </Box>
        )
    }

    const webhookUrl = journeyData.webhook_url

    return (
        <Box flexDirection="column">
            <PanelHeader title="Custom flow activated" padding="lg" />
            <Box flexDirection="column" padding="lg" paddingTop={0} gap="lg">
                <Text>
                    Your custom flow is now active. Configure the Klaviyo
                    webhook below to start sending events to Gorgias.
                </Text>
                {webhookUrl && <KlaviyoSetupCard webhookUrl={webhookUrl} />}
                <Box justifyContent="flex-end">
                    <Button
                        onClick={() =>
                            history.push(`/app/ai-journey/${shopName}/flows`)
                        }
                    >
                        Go to flows
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
