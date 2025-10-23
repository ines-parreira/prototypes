import { Text } from '@gorgias/axiom'

import { useMetafields } from './hooks/useMetafields'
import { columns } from './MetafieldsTable/Columns'
import MetafieldsTable from './MetafieldsTable/MetafieldsTable'

import styles from './ShopifyMetafields.less'

export default function ShopifyMetafields() {
    const { data = [], isLoading } = useMetafields()

    return (
        <div className={styles.metafieldsLandingPageContent}>
            <div className={styles.explainerContainer}>
                <Text variant="regular" as="p" size="md">
                    Manage <span className={styles.metafields}>metafields</span>{' '}
                    from your Shopify store to Gorgias and choose which ones to
                    show in each customer&apos;s profile.
                </Text>
            </div>

            <MetafieldsTable
                columns={columns}
                data={data}
                isLoading={isLoading}
            />
        </div>
    )
}
