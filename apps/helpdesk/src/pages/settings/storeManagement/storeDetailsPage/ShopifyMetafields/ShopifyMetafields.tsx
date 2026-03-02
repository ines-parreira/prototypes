import { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { useMetafields } from './hooks/useMetafields'
import { columns } from './MetafieldsTable/Columns'
import MetafieldsTable from './MetafieldsTable/MetafieldsTable'

import styles from './ShopifyMetafields.less'

export default function ShopifyMetafields() {
    const { data = [], isLoading } = useMetafields()

    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    useEffect(() => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenSettingsPage, {
            accountId,
            userId,
        })
    }, [accountId, userId])

    return (
        <div className={styles.metafieldsLandingPageContent}>
            <div className={styles.explainerContainer}>
                <Text variant="regular" as="p" size="md">
                    Manage{' '}
                    <span className={styles.metafields}>
                        <a
                            href="https://link.gorgias.com/4761a5"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            metafields
                        </a>
                    </span>{' '}
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
