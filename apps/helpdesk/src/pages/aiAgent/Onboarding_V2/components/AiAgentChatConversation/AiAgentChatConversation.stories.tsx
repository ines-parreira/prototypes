import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AttachmentEnum } from 'common/types'
import { GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT } from 'config/integrations/gorgias_chat'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import AiAgentChatConversation from './AiAgentChatConversation'

const storyConfig: Meta<typeof ChatIntegrationPreview> = {
    title: 'AI Agent/Onboarding_V2/ChatConversationPreview',
    component: ChatIntegrationPreview,
}

const defaultState = {
    billing: fromJS(billingState),
}

const Template: StoryFn<ComponentProps<typeof ChatIntegrationPreview>> = (
    props,
) => (
    <Provider store={configureMockStore()(defaultState)}>
        <ChatIntegrationPreview {...props} />
    </Provider>
)

const defaultProps: ComponentProps<typeof ChatIntegrationPreview> = {
    name: 'My ecommerce chat',
    mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    isOnline: true,
    renderFooter: false,
    hideButton: true,
    showBackground: false,
    mainColor: '#222222',
    background:
        'linear-gradient(180deg, #DDD 0.03%, #EEE 11.9%, #F9F9F9 99.97%)',
    children: null,
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    displayBotLabel: true,
    useMainColorOutsideBusinessHours: false,
}

export const ChatConversation = Template.bind({})
ChatConversation.args = {
    ...defaultProps,
    children: (
        <AiAgentChatConversation
            conversationColor="#222222"
            user={fromJS({
                ...user,
                name: 'AI Agent',
                meta: {
                    profile_picture_url:
                        'data:image/png;base64,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',
                },
            })}
            messages={[
                {
                    content:
                        'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
                    isHtml: false,
                    fromAgent: false,
                    attachments: [],
                },
                {
                    content:
                        'Hi 👋  Our sizes are made for all shapes and body types. Check out this standard size chart for a measurement guide and international conversion.',
                    isHtml: true,
                    fromAgent: true,
                    attachments: [
                        {
                            content_type: AttachmentEnum.Product,
                            name: 'ADIDAS | SUPERSTAR 80S',
                            size: 0,
                            url: 'https://test.com/products/test-product1',
                            extra: {
                                price: '120.5',
                                variant_name: 'ADIDAS | SUPERSTAR 80S',
                                product_link:
                                    'https://test.com/products/test-product1',
                                currency: 'USD',
                                featured_image:
                                    'https://athlete-shift.myshopify.com/cdn/shop/products/8cd561824439482e3cea5ba8e3a6e2f6.jpg?v=1661766740&width=533',
                                product_id: 1,
                                variant_id: 2,
                            },
                        },
                        {
                            content_type: AttachmentEnum.Product,
                            name: 'CONVERSE | CHUCK TAYLOR ALL STAR',
                            size: 0,
                            url: 'https://test.com/products/test-product2',
                            extra: {
                                price: '145.5',
                                variant_name:
                                    'CONVERSE | CHUCK TAYLOR ALL STAR',
                                product_link:
                                    'https://test.com/products/test-product2',
                                currency: 'USD',
                                featured_image:
                                    'https://athlete-shift.myshopify.com/cdn/shop/products/b5176e5151cdf20d15cff3f551274753.jpg?v=1661766675&width=533',
                                product_id: 3,
                                variant_id: 4,
                            },
                        },
                    ],
                },
                {
                    content: 'Was this helpful?',
                    isHtml: true,
                    fromAgent: true,
                    attachments: [],
                },
                {
                    content: 'Yes!',
                    isHtml: false,
                    fromAgent: false,
                    attachments: [],
                },
                {
                    content: 'Thanks for your help!',
                    isHtml: false,
                    fromAgent: false,
                    attachments: [],
                },
                {
                    content: 'You are welcome!',
                    isHtml: true,
                    fromAgent: true,
                    attachments: [],
                },
            ]}
        />
    ),
}

export default storyConfig
