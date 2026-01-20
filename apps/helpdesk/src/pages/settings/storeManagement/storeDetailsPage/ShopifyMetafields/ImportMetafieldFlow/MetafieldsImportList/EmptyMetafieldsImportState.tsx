import { Heading, Text } from '@gorgias/axiom'

import styles from './EmptyMetafieldsImportState.less'

export default function EmptyMetafieldsImportState() {
    return (
        <div className={styles.emptyMetafieldsImportState}>
            <Heading size="sm">No metafields available</Heading>
            <Text align="center">
                There are no metafields available to import in this category.
            </Text>
        </div>
    )
}
