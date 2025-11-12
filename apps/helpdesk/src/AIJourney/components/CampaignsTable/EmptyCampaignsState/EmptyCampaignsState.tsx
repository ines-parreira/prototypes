import { useHistory } from 'react-router-dom'

import { Button, Heading, Text } from '@gorgias/axiom'

import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

import styles from './EmptyCampaignsState.less'

export default function EmptyCampaignsState() {
    const history = useHistory()
    const { shopName } = useJourneyContext()

    return (
        <div className={styles.emptyMetafieldsState}>
            <Heading>Create your first campaign</Heading>
            <Text as="p" align="center">
                Start reaching your customers today
            </Text>
            <Button
                onClick={() =>
                    history.push(
                        `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
                    )
                }
            >
                Create campaign
            </Button>
        </div>
    )
}
