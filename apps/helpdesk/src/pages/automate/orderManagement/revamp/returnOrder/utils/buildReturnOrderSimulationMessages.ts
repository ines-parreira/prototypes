import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'
import type { SimulateConversationMessage } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel'

const DESCRIPTION = "I'd like to return the following items:"
const SAMPLE_ORDER_NUMBER = '#3089'
const SAMPLE_ITEM_NAMES = '1x Graphic T-Shirt, 1x Chain Bracelet'
const SAMPLE_TOTAL = '$20.00'
const SAMPLE_ORDER_CREATED = '12/15/2022, 22:02'
const SAMPLE_SHIPPING_ADDRESS = '52 Washburn, SF, CA, 94027'

const buildLine = (label: string, value: string) =>
    `<div>${label}: <span style="font-weight: 500;">${value}</span></div>`

const RETURN_ORDER_MESSAGE_HTML = [
    '<div>',
    `<div><span style="font-weight: 500;">${DESCRIPTION}</span></div>`,
    buildLine('Order number', SAMPLE_ORDER_NUMBER),
    buildLine('Items requested for return', SAMPLE_ITEM_NAMES),
    buildLine('Total', SAMPLE_TOTAL),
    buildLine('Order Created', SAMPLE_ORDER_CREATED),
    buildLine('Shipping address', SAMPLE_SHIPPING_ADDRESS),
    '</div>',
].join('')

export const buildReturnOrderSimulationMessages = (
    responseMessageContent: ResponseMessageContent | undefined,
): SimulateConversationMessage[] => {
    const messages: SimulateConversationMessage[] = [
        {
            text: RETURN_ORDER_MESSAGE_HTML,
            isHtml: true,
            fromAgent: false,
            isBot: false,
        },
    ]

    if (responseMessageContent && responseMessageContent.text.length > 0) {
        messages.push({
            text: responseMessageContent.html,
            isHtml: true,
            fromAgent: true,
            isBot: true,
        })
    }

    return messages
}
