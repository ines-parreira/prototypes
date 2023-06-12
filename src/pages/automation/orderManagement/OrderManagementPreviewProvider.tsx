import React, {ReactNode, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'
import useSelfServiceChannels, {
    SelfServiceChannel,
} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {IntegrationType} from 'models/integration/constants'

import OrderManagementPreviewContext, {
    OrderManagementPreviewContextType,
} from './OrderManagementPreviewContext'

type Props = {
    children: ReactNode
}

const OrderManagementPreviewProvider = ({children}: Props) => {
    const {shopName} = useParams<{shopName: string}>()
    const allChannels = useSelfServiceChannels(
        IntegrationType.Shopify,
        shopName
    )

    // filter out contact form channels until contact forms gain order management features
    const channels = useMemo(
        () =>
            allChannels.filter(({type}) => type !== TicketChannel.ContactForm),
        [allChannels]
    )

    const [channel, setChannel] = useState<SelfServiceChannel | undefined>(
        channels[0]
    )

    const orderManagementPreviewContext =
        useMemo<OrderManagementPreviewContextType>(
            () => ({
                channels,
                channel,
                onChannelChange: setChannel,
            }),
            [channels, channel, setChannel]
        )

    return (
        <OrderManagementPreviewContext.Provider
            value={orderManagementPreviewContext}
        >
            {children}
        </OrderManagementPreviewContext.Provider>
    )
}

export default OrderManagementPreviewProvider
