import type { ConversationMessage } from 'pages/aiAgent/Onboarding_V2/components/AiAgentChatConversation/AiAgentChatConversation'

export const ENGAGEMENT_PREVIEW_MESSAGES: ConversationMessage[] = [
    {
        content: 'Hey there 👋 How can I help?',
        isHtml: false,
        fromAgent: true,
        attachments: [],
    },
    {
        content:
            "Hi, I'm after a pair of sandals for everyday wear, something comfortable and cute",
        isHtml: false,
        fromAgent: false,
        attachments: [],
    },
    {
        content: "Of course, what's your budget? We've got plenty of options!",
        isHtml: false,
        fromAgent: true,
        attachments: [],
    },
    {
        content: 'I have budgeted 150$',
        isHtml: false,
        fromAgent: false,
        attachments: [],
    },
]
