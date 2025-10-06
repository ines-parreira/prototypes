import { Text } from '@gorgias/axiom'

import styles from './ShopifyMetafields.less'

export default function ShopifyMetafields() {
    return (
        <div className={styles.explainerContainer}>
            <Text variant="regular" as="p" size="md">
                Manage <span className={styles.metafields}>metafields</span>{' '}
                from your Shopify store to Gorgias and choose which ones to show
                in each customer&apos;s profile.
            </Text>
        </div>
    )
}
