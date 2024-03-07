import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import {IntegrationType} from 'models/integration/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {TicketChannel} from 'business/types/ticket'

export type SelfServiceHelpCenterChannel = {
    type: TicketChannel.HelpCenter
    value: HelpCenter
}

const useSelfServiceHelpCenterChannels = (
    shopType: string,
    shopName: string
) => {
    const helpCenters = useAppSelector(getHelpCenterList)

    return useMemo<SelfServiceHelpCenterChannel[]>(() => {
        if (shopType !== IntegrationType.Shopify) {
            return []
        }

        return helpCenters
            .filter((helpCenter) => helpCenter.shop_name === shopName)
            .map((helpCenter) => ({
                type: TicketChannel.HelpCenter,
                value: helpCenter,
            }))
    }, [helpCenters, shopType, shopName])
}

export default useSelfServiceHelpCenterChannels
