import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

export type SelfServiceHelpCenterChannel = {
    type: TicketChannel.HelpCenter
    value: HelpCenter
}

const useSelfServiceHelpCenterChannels = (
    shopType: string,
    shopName: string,
) => {
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const { data: helpCenters } = useGetHelpCenterList(
        {
            shop_name: shopName,
            type: 'faq',
        },
        {
            enabled: !!storeIntegration,
        },
    )

    return useMemo<SelfServiceHelpCenterChannel[]>(() => {
        if (!storeIntegration) {
            return []
        }

        return (
            helpCenters?.data.data
                .filter((helpCenter) => helpCenter.shop_name === shopName)
                .map((helpCenter) => ({
                    type: TicketChannel.HelpCenter,
                    value: helpCenter,
                })) ?? []
        )
    }, [helpCenters, storeIntegration, shopName])
}

export default useSelfServiceHelpCenterChannels
