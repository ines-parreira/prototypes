import { Button, Heading, Text } from '@gorgias/axiom'

import styles from './EmptyMetafieldsState.less'

export default function EmptyMetafieldsState() {
    return (
        <div className={styles.emptyMetafieldsState}>
            <Heading>You haven’t added any metafields yet</Heading>
            <Text as="p" align="center">
                Once you import them, you can manage them here. Please add one
                to use the data in customer profiles, macros, rules, flows,
                views and advanced search.{' '}
            </Text>
            <Button leadingSlot="add">Import</Button>
        </div>
    )
}
