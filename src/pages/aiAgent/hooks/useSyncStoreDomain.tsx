import { useCallback, useMemo, useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import {
    getShopDomainFromStoreIntegration,
    getShopUrlFromStoreIntegration,
} from 'models/selfServiceConfiguration/utils'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { IngestionType } from '../AiAgentScrapedDomainContent/constant'
import { useGetStoreDomainIngestionLog } from './useGetStoreDomainIngestionLog'
import { useIngestionLogMutation } from './useIngestionLogMutation'

export const useSyncStoreDomain = ({
    helpCenterId,
    shopName,
}: {
    helpCenterId: number
    shopName: string
}) => {
    const dispatch = useAppDispatch()
    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()
    const storeDomain = getShopDomainFromStoreIntegration(storeIntegration)
    const storeUrl = getShopUrlFromStoreIntegration(storeIntegration)
    const [syncTriggered, setSyncTriggered] = useState(false)

    const {
        storeDomainIngestionLog,
        isGetIngestionLogsLoading: isFetchLoading,
    } = useGetStoreDomainIngestionLog({
        helpCenterId,
        storeUrl,
    })

    const { startIngestion } = useIngestionLogMutation({
        helpCenterId,
        queryKey: ['store-domain-ingestion-logs', helpCenterId, storeUrl],
    })

    const handleOnSync = useCallback(() => {
        setSyncTriggered(false)

        if (!storeUrl) return

        try {
            startIngestion({ url: storeUrl, type: IngestionType.Domain })
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Store Domain sync. Please try again later or contact support',
                }),
            )
        }
    }, [dispatch, startIngestion, storeUrl])

    const handleTriggerSync = useCallback(() => {
        if (storeDomainIngestionLog) {
            setSyncTriggered(true)
        } else {
            handleOnSync()
        }
    }, [handleOnSync, storeDomainIngestionLog])

    const handleOnCancel = useCallback(() => setSyncTriggered(false), [])

    return useMemo(
        () => ({
            storeDomain,
            storeUrl,
            storeDomainIngestionLog,
            isFetchLoading,
            syncTriggered,
            handleTriggerSync,
            handleOnSync,
            handleOnCancel,
        }),
        [
            storeDomain,
            storeUrl,
            storeDomainIngestionLog,
            isFetchLoading,
            syncTriggered,
            handleTriggerSync,
            handleOnSync,
            handleOnCancel,
        ],
    )
}
