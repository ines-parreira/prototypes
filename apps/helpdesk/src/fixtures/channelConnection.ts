import type { ChannelConnection } from 'models/convert/channelConnection/types'
import { ChannelConnectionChannel } from 'models/convert/channelConnection/types'

export const channelConnectionId = 'ca920935-acda-48a4-b885-bae77fcada05'

export const channelConnection: ChannelConnection = {
    store_integration_id: 42,
    external_id: 'app123456',
    external_installation_status: 'installed',
    is_setup: false,
    is_onboarded: false,
    channel: ChannelConnectionChannel.Widget,
    account_id: 1,
    id: channelConnectionId,
}
