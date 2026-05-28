import { useEffect } from 'react'

import { Card, Elevation, Heading, Text, ToggleField } from '@gorgias/axiom'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import css from '../../GorgiasChatIntegrationAppearance.less'

const PREVIEW_BOT_CONVERSATION = [
    {
        text: 'I have a question about my order.',
        fromAgent: false,
        isBot: false,
    },
    {
        text: 'Hi! How can I help you today?',
        fromAgent: true,
        isBot: true,
    },
]

type Props = {
    displayBotLabel: boolean
    onDisplayBotLabelChange: (value: boolean) => void
}

export const ChatbotCard = ({
    displayBotLabel,
    onDisplayBotLabelChange,
}: Props) => {
    const {
        updateDisplayBotLabel,
        setConversationMessages,
        onChatPreviewLoaded,
    } = useChatPreviewPanelContext()

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            setConversationMessages(PREVIEW_BOT_CONVERSATION)
        }, true)
    }, [onChatPreviewLoaded, setConversationMessages])

    const handleChange = (value: boolean) => {
        onDisplayBotLabelChange(value)
        setConversationMessages(PREVIEW_BOT_CONVERSATION)
        updateDisplayBotLabel(value)
    }

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Chatbot</Heading>
                    <Text size="md" className={css.cardDescription}>
                        Control how automated messages are presented to
                        shoppers.
                    </Text>
                </div>
                <div className={css.mainContent}>
                    <ToggleField
                        value={displayBotLabel}
                        onChange={handleChange}
                        label="Display “Bot” next to chat title for automated messages"
                    />
                </div>
            </div>
        </Card>
    )
}
