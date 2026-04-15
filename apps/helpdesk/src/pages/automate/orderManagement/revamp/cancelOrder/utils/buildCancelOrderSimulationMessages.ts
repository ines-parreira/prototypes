import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'
import type { SimulateConversationMessage } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/ChatPreviewPanel'

// Sample order data used for the cancel order simulation preview.
// Mirrors the format produced by the widget's buildTemplatedMessage for Flow.CANCEL.
const DESCRIPTION = "I'd like to cancel the following fulfillment"
const DELIMITER = '---------------------------------------'
const SAMPLE_ORDER_NUMBER = '#3089'
const SAMPLE_FULFILLMENT = '#3089-F1'
const SAMPLE_ITEM_NAMES = 'Graphic T-Shirt, Chain Bracelet'
const SAMPLE_TRACKING_URL = 'jsjs.tracking.com'
const SAMPLE_ORDER_CREATED = '12/15/2022, 22:02'
const SAMPLE_SHIPPING_ADDRESS = '52 Washburn, SF, CA, 94027'

const buildLine = (label: string, value: string) =>
    `<div>${label}: <span style="font-weight: 500;">${value}</span></div>`

const CANCEL_ORDER_MESSAGE_HTML = [
    '<div>',
    `<div><span style="font-weight: 500;">${DESCRIPTION}</span></div>`,
    `<div>${DELIMITER}</div>`,
    buildLine('Order number', SAMPLE_ORDER_NUMBER),
    buildLine('Fulfillment', SAMPLE_FULFILLMENT),
    buildLine('Item names', SAMPLE_ITEM_NAMES),
    buildLine('Tracking Url', SAMPLE_TRACKING_URL),
    buildLine('Order Created', SAMPLE_ORDER_CREATED),
    buildLine('Shipping address', SAMPLE_SHIPPING_ADDRESS),
    '</div>',
].join('')

export const buildCancelOrderSimulationMessages = (
    responseMessageContent: ResponseMessageContent,
): SimulateConversationMessage[] => {
    const messages: SimulateConversationMessage[] = [
        { text: CANCEL_ORDER_MESSAGE_HTML, isHtml: true, fromAgent: false },
    ]

    if (responseMessageContent.text.length > 0) {
        messages.push({
            text: responseMessageContent.html,
            isHtml: true,
            fromAgent: true,
        })
    }

    return messages
}
