import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AttachmentEnum } from 'common/types'
import { CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES } from 'config/integrations'
import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
} from 'config/integrations/gorgias_chat'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import ChatIntegrationPreview from './ChatIntegrationPreview'
import MessageContent from './MessageContent'

import css from './ChatIntegrationPreview.less'

const defaultState = {
    billing: fromJS(billingState),
}

const storyConfig: Meta = {
    title: 'Chat/ChatIntegrationPreview',
    component: ChatIntegrationPreview,
    parameters: {
        docs: {
            description: {
                component: 'ChatIntegrationPreview',
            },
        },
    },
    argTypes: {},
}

type Story = StoryObj<typeof ChatIntegrationPreview>

const Template: Story = {
    render: (props) => (
        <Provider store={configureMockStore()(defaultState)}>
            <ChatIntegrationPreview {...props} />
        </Provider>
    ),
}

const defaultProps: ComponentProps<typeof ChatIntegrationPreview> = {
    name: 'My chat',
    mainColor: GORGIAS_CHAT_DEFAULT_COLOR,
    mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    isOnline: true,
    children: (
        <MessageContent
            conversationColor=""
            currentUser={fromJS(user)}
            customerInitialMessages={['Hello']}
            agentMessages={[
                { content: 'Nice to meet you', isHtml: false, attachments: [] },
            ]}
        />
    ),
    introductionText: 'How can we help?',
    autoResponderEnabled: true,
    autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    displayBotLabel: true,
    useMainColorOutsideBusinessHours: false,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const Offline = {
    ...Template,
    args: {
        ...defaultProps,
        isOnline: false,
        offlineIntroductionText: 'Leave us a message',
    },
}

export const WithoutButton = {
    ...Template,
    args: { ...defaultProps, hideButton: true },
}

export const WithoutIntroductionText = {
    ...Template,
    args: { ...defaultProps, introductionText: undefined },
}

export const WithoutMessages = {
    ...Template,
    args: {
        ...defaultProps,
        children: <div className={css.content} />,
    },
}

export const WithoutPoweredBy = {
    ...Template,
    args: {
        ...defaultProps,
        renderPoweredBy: false,
    },
}

export const WithoutFooter = {
    ...Template,
    args: {
        ...defaultProps,
        renderFooter: false,
    },
}

export const WithoutAutoResponder = {
    ...Template,
    args: {
        ...defaultProps,
        autoResponderEnabled: false,
    },
}

export const WithGoBackButton = {
    ...Template,
    args: {
        ...defaultProps,
        showGoBackButton: true,
    },
}

export const WithGoBackButtonAndAnimations = {
    ...Template,
    args: {
        ...defaultProps,
        showGoBackButton: true,
        enableAnimations: true,
    },
}

export const WithAgentMessagesAnimations = {
    ...Template,
    args: {
        ...defaultProps,
        children: (
            <MessageContent
                conversationColor=""
                currentUser={fromJS(user)}
                customerInitialMessages={['Hello']}
                agentMessages={[
                    {
                        content:
                            'Hi 👋  Our sizes are made for all shapes and body types. Check out this standard size chart for a measurement guide and international conversion.',
                        isHtml: false,
                        attachments: [],
                    },
                    {
                        content: 'Was this helpful?',
                        isHtml: false,
                        attachments: [],
                    },
                ]}
                enableAgentMessagesAnimations
            />
        ),
    },
}

export const WithProductCards = {
    ...Template,
    args: {
        ...defaultProps,
        children: (
            <MessageContent
                conversationColor=""
                currentUser={fromJS(user)}
                customerInitialMessages={['Hello']}
                agentMessages={[
                    {
                        content:
                            'Hi 👋  Our sizes are made for all shapes and body types. Check out this standard size chart for a measurement guide and international conversion.',
                        isHtml: false,
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
                                        'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
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
                                        'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
                                    product_id: 3,
                                    variant_id: 4,
                                },
                            },
                        ],
                    },
                    {
                        content: 'Was this helpful?',
                        isHtml: false,
                        attachments: [],
                    },
                ]}
                enableAgentMessagesAnimations
            />
        ),
    },
}

export const CustomFontImpact = {
    ...Template,
    args: {
        ...defaultProps,
        mainFontFamily: 'Impact',
    },
}

export const CustomFontDeliciousHandrawn = {
    ...Template,
    args: {
        ...defaultProps,
        mainFontFamily: 'Delicious Handrawn',
    },
}

export default storyConfig
