import type { HandoverConfigurationResponse } from 'models/aiAgent/types'

import { AiAgentChannel } from '../constants'

export const getHandoverConfigurationsFixture =
    (): HandoverConfigurationResponse => ({
        handoverConfigurations: [
            {
                accountId: 1,
                storeName: 'gorgiastest',
                shopType: 'shopify',
                integrationId: 5008,
                channel: AiAgentChannel.Chat,
                onlineInstructions: null,
                offlineInstructions: 'Offline instructions',
                shareBusinessHours: false,
            },
            {
                accountId: 2,
                storeName: 'gorgiastest2',
                shopType: 'shopify',
                integrationId: 5009,
                channel: AiAgentChannel.Email,
                onlineInstructions: null,
                offlineInstructions: 'Offline instructions 2',
                shareBusinessHours: false,
            },
        ],
    })
