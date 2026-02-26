import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/MessageContent'
import { getCurrentUser } from 'state/currentUser/selectors'

import useOrderDates from './hooks/useOrderDates'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationCancelPage = ({ integration }: Props) => {
    const currentUser = useAppSelector(getCurrentUser)

    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const { automatedResponseMessageContent } = useSelfServicePreviewContext()
    const { orderPlacedDate } = useOrderDates(language)

    const templatedMessage = (
        <>
            <b>{sspTexts.cancelMessageDescription}:</b>
            <div>&nbsp;</div>
            <div>
                {sspTexts.orderNumber}: <b>#3089</b>
            </div>
            <div>
                {sspTexts.fulfillment}: <b>#3089-F1</b>
            </div>
            <div>
                {sspTexts.itemNames}: <b>Graphic T-Shirt, Chain Bracelet</b>
            </div>
            <div>
                {sspTexts.trackingUrl}: <b>jsjs.tracking.com</b>
            </div>
            <div>
                {sspTexts.orderCreated}:{' '}
                <b>{orderPlacedDate.format('L HH:mm')}</b>
            </div>
            <div>
                {sspTexts.shippingAddress}: <b>52 Washburn, SF, CA, 94027</b>
            </div>
        </>
    )
    const agentMessages = automatedResponseMessageContent?.text.length
        ? [
              {
                  content: automatedResponseMessageContent.html,
                  isHtml: true,
                  attachments: [],
              },
          ]
        : []

    return (
        <MessageContent
            conversationColor={integration.decoration.conversation_color}
            currentUser={currentUser}
            customerInitialMessages={[templatedMessage]}
            agentMessages={agentMessages}
            hideConversationTimestamp
        />
    )
}

export default SelfServiceChatIntegrationCancelPage
