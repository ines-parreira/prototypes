import { HandoverConfigurationData } from 'models/aiAgent/types'
import { IntegrationType } from 'models/integration/constants'

import { AiAgentChannel } from '../constants'

const mapIntegrationTypeToAiAgentChannel = (type: IntegrationType) => {
    switch (type) {
        case IntegrationType.GorgiasChat:
            return AiAgentChannel.Chat
        case IntegrationType.Email:
            return AiAgentChannel.Email
        default:
            throw new Error(`Unsupported ai agent channel type: ${type}`)
    }
}

type CreateHandoverConfigurationDataProps = {
    accountId: number
    storeName: string
    shopType: string
    integrationId: number
    integrationType: IntegrationType
}

export const createHandoverConfigurationData = ({
    accountId,
    storeName,
    shopType,
    integrationId,
    integrationType,
}: CreateHandoverConfigurationDataProps): HandoverConfigurationData => {
    return {
        accountId,
        storeName,
        shopType,
        integrationId,
        channel: mapIntegrationTypeToAiAgentChannel(integrationType),
        onlineInstructions: undefined,
        offlineInstructions: undefined,
        shareBusinessHours: false,
    }
}
