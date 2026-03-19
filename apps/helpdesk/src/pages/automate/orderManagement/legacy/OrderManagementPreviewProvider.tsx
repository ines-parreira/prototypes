import type { ReactNode } from 'react'
import React, { useMemo, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'

import { useHistoryTracking } from '../../common/hooks/useHistoryTracking'
import type { OrderManagementPreviewContextType } from './OrderManagementPreviewContext'
import OrderManagementPreviewContext from './OrderManagementPreviewContext'

type Props = {
    children: ReactNode
}

const OrderManagementPreviewProvider = ({ children }: Props) => {
    useHistoryTracking(SegmentEvent.AutomateOrderManagementVisited)
    const { shopName } = useParams<{ shopName: string }>()
    const channels = useSelfServiceChannels(IntegrationType.Shopify, shopName)

    const [channel, setChannel] = useState<SelfServiceChannel | undefined>(
        channels[0],
    )

    const orderManagementPreviewContext =
        useMemo<OrderManagementPreviewContextType>(
            () => ({
                channels,
                channel,
                onChannelChange: setChannel,
            }),
            [channels, channel, setChannel],
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
