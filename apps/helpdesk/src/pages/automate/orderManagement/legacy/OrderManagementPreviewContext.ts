import { createContext, useContext } from 'react'

import _noop from 'lodash/noop'

import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'

export type OrderManagementPreviewContextType = {
    channels: SelfServiceChannel[]
    channel: SelfServiceChannel | undefined
    onChannelChange: (channel: SelfServiceChannel | undefined) => void
}

const OrderManagementPreviewContext =
    createContext<OrderManagementPreviewContextType>({
        channels: [],
        channel: undefined,
        onChannelChange: _noop,
    })

export const useOrderManagementPreviewContext = () =>
    useContext(OrderManagementPreviewContext)

export default OrderManagementPreviewContext
