import { Box, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { SendTestCard } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'

import css from './Activation.less'

export const Activation = () => {
    const { journeyData, isLoading: isLoadingJourneyData } = useJourneyContext()

    const isLoading = isLoadingJourneyData

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (!journeyData) {
        return (
            <div className={css.container}>
                <p>Page not found.</p>
            </div>
        )
    }

    return (
        <Box>
            <SendTestCard />
        </Box>
    )
}
