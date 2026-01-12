import { useHistory } from 'react-router-dom'

import { Box, Button, Heading, Text } from '@gorgias/axiom'

import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import css from './OpportunitiesEmptyState.less'

export const OpportunitiesEmptyState = ({
    opportunitiesPageState,
}: {
    opportunitiesPageState: OpportunityPageState
}) => {
    const history = useHistory()

    const redirectTo = () => {
        if (opportunitiesPageState.primaryCta?.href) {
            history.push(opportunitiesPageState.primaryCta.href)
        }
    }

    return (
        <div className={css.containerContent}>
            <div className={css.mediaFrame}>
                {/* TODO: Add media when available from design team*/}
                {/* <img
                    src={opportunitiesPageState.media ?? ''}
                    alt="Opportunities empty state"
                /> */}
            </div>
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="md">{opportunitiesPageState.title}</Heading>
                <Text size="md" variant="regular" align="center">
                    {opportunitiesPageState.description}
                </Text>
            </Box>
            {opportunitiesPageState.primaryCta && (
                <Button variant="primary" onClick={redirectTo}>
                    {opportunitiesPageState.primaryCta?.label}
                </Button>
            )}
        </div>
    )
}
