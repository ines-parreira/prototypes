import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'

import { SendTestCard } from 'AIJourney/components'
import { useJourneyContext } from 'AIJourney/providers'

import css from './Activation.less'

export const Activation = () => {
    const {
        journeyData,
        isLoading: isLoadingJourneyData,
        isErrorJourneyData,
        shopName,
    } = useJourneyContext()
    const history = useHistory()

    const isLoading = isLoadingJourneyData

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (!journeyData) {
        return (
            <div className={css.container}>
                <Text>
                    {isErrorJourneyData
                        ? 'This flow could not be loaded. Please refresh the page or go back and try again.'
                        : 'This flow could not be found. It may not have been created yet.'}
                </Text>
                <Button
                    variant="secondary"
                    onClick={() =>
                        history.push(`/app/ai-journey/${shopName}/flows`)
                    }
                >
                    Go to flows
                </Button>
            </div>
        )
    }

    return (
        <Box>
            <SendTestCard />
        </Box>
    )
}
