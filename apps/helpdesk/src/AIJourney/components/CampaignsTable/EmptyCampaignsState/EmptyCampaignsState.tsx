import { Button, Heading, Text } from '@gorgias/axiom'

import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'

import styles from './EmptyCampaignsState.less'

export default function EmptyCampaignsState() {
    return (
        <div className={styles.emptyMetafieldsState}>
            <Heading>Create your first campaign</Heading>
            <Text as="p" align="center">
                Start reaching your customers today
            </Text>
            <Button
                as="a"
                href={`${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`}
                target="_self"
            >
                Create campaign
            </Button>
        </div>
    )
}
