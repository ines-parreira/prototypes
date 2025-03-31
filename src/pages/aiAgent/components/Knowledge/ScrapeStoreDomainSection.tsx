import React from 'react'

import { Button, Label } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import useId from 'hooks/useId'
import { ShopifyIntegration } from 'models/integration/types'
import {
    getShopDomainFromStoreIntegration,
    getShopUrlFromStoreIntegration,
} from 'models/selfServiceConfiguration/utils'
import {
    getFormattedSyncDate,
    getFormattedSyncDatetime,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetStoreDomainIngestionLog } from 'pages/aiAgent/hooks/useGetStoreDomainIngestionLog'
import ItemWithTooltip from 'pages/common/components/ItemWithTooltip/ItemWithTooltip'
import history from 'pages/history'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

import css from './ScrapeStoreDomainSection.less'

type Props = {
    shopName: string
    helpCenterId: number
}

export const ScrapeStoreDomainSection = ({ shopName, helpCenterId }: Props) => {
    const id = useId()
    const syncDateId = `syncDate-${id}`

    const { routes } = useAiAgentNavigation({ shopName })
    const onManage = () => {
        history.push(routes.pagesContent)
    }
    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()
    const storeDomain = getShopDomainFromStoreIntegration(storeIntegration)
    const storeUrl = getShopUrlFromStoreIntegration(storeIntegration)

    const { storeDomainIngestionLog } = useGetStoreDomainIngestionLog({
        helpCenterId,
        storeUrl,
    })

    const latestSync = storeDomainIngestionLog?.latest_sync
    const syncDateString = getFormattedSyncDate(latestSync)
    const syncDateTimeString = getFormattedSyncDatetime(latestSync)

    // this functionality will be implemented in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-99/implement-sync-mechanism-and-its-loading-state-for-knowledge-and
    const onSync = () => {}

    return (
        <>
            <div className={css.label}>
                <Label>Your store domain</Label>
                <span>AI Agent uses content from your store website.</span>
            </div>
            <div className={css.storeDomain}>
                <a
                    className={css.domain}
                    href={`https://${storeDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className={css.icon}>
                        <i className="material-icons">language</i>
                    </span>
                    {storeDomain}
                </a>
                <div className={css.actions}>
                    {latestSync && (
                        <ItemWithTooltip
                            id={syncDateId}
                            item={`Last synced ${syncDateString}`}
                            tooltip={syncDateTimeString}
                        />
                    )}
                    <div>
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={onSync}
                            leadingIcon="sync"
                        >
                            Sync
                        </Button>
                        <Button
                            intent="primary"
                            fillStyle="ghost"
                            onClick={onManage}
                        >
                            Manage
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
