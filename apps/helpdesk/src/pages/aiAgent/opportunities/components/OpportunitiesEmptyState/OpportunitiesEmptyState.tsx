import classNames from 'classnames'
import Lottie from 'lottie-react'
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
        <div
            className={classNames(css.containerContent, {
                [css.noMedia]: !opportunitiesPageState.media,
            })}
        >
            {opportunitiesPageState.media && (
                <div className={css.mediaFrame}>
                    {typeof opportunitiesPageState.media === 'object' ? (
                        <Lottie
                            animationData={opportunitiesPageState.media}
                            loop={true}
                            autoplay={true}
                            aria-label="Opportunities empty state"
                            role="img"
                        />
                    ) : (
                        <img
                            className={css.media}
                            src={opportunitiesPageState.media}
                            alt="Opportunities empty state"
                        />
                    )}
                </div>
            )}
            <Box flexDirection="column" gap="xs" alignItems="center">
                <Heading size="lg" className={css.title}>
                    {opportunitiesPageState.title}
                </Heading>
                <Text
                    size="md"
                    variant="regular"
                    align="center"
                    className={css.description}
                >
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
