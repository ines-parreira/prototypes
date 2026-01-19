import { Box, Button, Heading, Text } from '@gorgias/axiom'

import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import css from './RestrictedOpportunityMessage.less'

const BOOK_DEMO_URL =
    'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_opportunities'

interface RestrictedOpportunityMessageProps {
    opportunitiesPageState: OpportunityPageState
}

export const RestrictedOpportunityMessage = ({
    opportunitiesPageState,
}: RestrictedOpportunityMessageProps) => {
    const handleBookDemo = () => {
        window.open(BOOK_DEMO_URL, '_blank')
    }

    return (
        <div className={css.containerContent}>
            {opportunitiesPageState.media && (
                <div className={css.mediaFrame}>
                    <img
                        className={css.media}
                        src={opportunitiesPageState.media}
                        alt="Upgrade opportunities"
                    />
                </div>
            )}
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="lg">{opportunitiesPageState.title}</Heading>
                <Text size="md" variant="regular" align="center">
                    {opportunitiesPageState.description}
                </Text>
            </Box>
            <Button variant="primary" onClick={handleBookDemo}>
                Book a demo
            </Button>
        </div>
    )
}
