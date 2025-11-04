import { Heading, Text } from '@gorgias/axiom'

import { Button } from 'AIJourney/components'

import styles from './EmptyCampaignsState.less'

export default function EmptyCampaignsState() {
    return (
        <div className={styles.emptyMetafieldsState}>
            <Heading>Create your first campaign</Heading>
            <Text as="p" align="center">
                Start reaching your customers today
            </Text>
            <Button label="Create campaign" />
        </div>
    )
}
