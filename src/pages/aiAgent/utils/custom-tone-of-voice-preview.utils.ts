import {CreatePlaygroundBody} from 'models/aiAgentPlayground/types'

import {
    AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET,
    PLAYGROUND_CUSTOMER_MOCK,
} from '../constants'

type CustomTOVPreviewInput = {
    gorgiasDomain: string
    accountId: number
    storeName: string
    customToneOfVoice: string
}

export const createCustomToneOfVoicePreviewBody = (
    input: CustomTOVPreviewInput
): CreatePlaygroundBody => {
    const {gorgiasDomain, accountId, storeName, customToneOfVoice} = input

    const messageCustomer = PLAYGROUND_CUSTOMER_MOCK

    const customTOVTicket = AI_AGENT_CUSTOM_TONE_OF_VOICE_TICKET

    return {
        domain: gorgiasDomain,
        from_agent: false,
        customer_email: messageCustomer.email,
        customer: messageCustomer,
        body_text: customTOVTicket.bodyText,
        subject: customTOVTicket.subject,
        http_integration_id: 1,
        account_id: accountId,
        messages: [
            {
                bodyText: customTOVTicket.bodyText,
                fromAgent: false,
                meta: {
                    name: messageCustomer.name,
                },
                createdDatetime: new Date().toISOString(),
            },
        ],
        created_datetime: new Date().toISOString(),
        channel: 'email',
        _playground_options: {
            shopName: storeName,
            customToneOfVoice,
        },
    }
}
