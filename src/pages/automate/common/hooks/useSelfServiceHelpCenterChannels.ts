import {useMemo} from 'react'
import {IntegrationType} from 'models/integration/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {TicketChannel} from 'business/types/ticket'
import {useGetHelpCenterList} from 'models/helpCenter/queries'

export type SelfServiceHelpCenterChannel = {
    type: TicketChannel.HelpCenter
    value: HelpCenter
}

const useSelfServiceHelpCenterChannels = (
    shopType: string,
    shopName: string
) => {
    const {data: helpCenters} = useGetHelpCenterList({
        shop_name: shopName,
    })

    return useMemo<SelfServiceHelpCenterChannel[]>(() => {
        if (shopType !== IntegrationType.Shopify) {
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
    }, [helpCenters, shopName, shopType])
}

export default useSelfServiceHelpCenterChannels
