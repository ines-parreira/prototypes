import {useMemo} from 'react'
import {HelpCenter} from 'models/helpCenter/types'
import {TicketChannel} from 'business/types/ticket'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

export type SelfServiceHelpCenterChannel = {
    type: TicketChannel.HelpCenter
    value: HelpCenter
}

const useSelfServiceHelpCenterChannels = (
    shopType: string,
    shopName: string
) => {
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const {data: helpCenters} = useGetHelpCenterList(
        {
            shop_name: storeIntegration?.name,
            type: 'faq',
        },
        {
            enabled: !!storeIntegration,
        }
    )

    return useMemo<SelfServiceHelpCenterChannel[]>(() => {
        if (!storeIntegration) {
            return []
        }

        return (
            helpCenters?.data.data
                .filter(
                    (helpCenter) =>
                        helpCenter.shop_name === storeIntegration.name
                )
                .map((helpCenter) => ({
                    type: TicketChannel.HelpCenter,
                    value: helpCenter,
                })) ?? []
        )
    }, [helpCenters, storeIntegration])
}

export default useSelfServiceHelpCenterChannels
