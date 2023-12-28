import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {user} from 'fixtures/users'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES} from 'config/integrations'
import ChatIntegrationPreview from './ChatIntegrationPreview'
import css from './ChatIntegrationPreview.less'
import MessageContent from './MessageContent'

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

const Template: Story<ComponentProps<typeof ChatIntegrationPreview>> = (
    props
) => <ChatIntegrationPreview {...props} />

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
                {content: 'Nice to meet you', isHtml: false, attachments: []},
            ]}
        />
    ),
    introductionText: 'How can we help?',
    autoResponderEnabled: true,
    autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    displayBotLabel: true,
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
}

export const Default = Template.bind({})
Default.args = defaultProps

export const Offline = Template.bind({})
Offline.args = {
    ...defaultProps,
    isOnline: false,
    offlineIntroductionText: 'Leave us a message',
}

export const WithoutButton = Template.bind({})
WithoutButton.args = {...defaultProps, hideButton: true}

export const WithoutIntroductionText = Template.bind({})
WithoutIntroductionText.args = {...defaultProps, introductionText: undefined}

export const WithoutMessages = Template.bind({})
WithoutMessages.args = {
    ...defaultProps,
    children: <div className={css.content} />,
}

export const WithoutPoweredBy = Template.bind({})
WithoutPoweredBy.args = {
    ...defaultProps,
    renderPoweredBy: false,
}

export const WithoutFooter = Template.bind({})
WithoutFooter.args = {
    ...defaultProps,
    renderFooter: false,
}

export const WithoutAutoResponder = Template.bind({})
WithoutAutoResponder.args = {
    ...defaultProps,
    autoResponderEnabled: false,
}

export const WithGoBackButton = Template.bind({})
WithGoBackButton.args = {
    ...defaultProps,
    showGoBackButton: true,
}

export const WithGoBackButtonAndAnimations = Template.bind({})
WithGoBackButtonAndAnimations.args = {
    ...defaultProps,
    showGoBackButton: true,
    enableAnimations: true,
}

export const WithAgentMessagesAnimations = Template.bind({})
WithAgentMessagesAnimations.args = {
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
}

export const CustomFontImpact = Template.bind({})
CustomFontImpact.args = {
    ...defaultProps,
    mainFontFamily: 'Impact',
}

export const CustomFontDeliciousHandrawn = Template.bind({})
CustomFontImpact.args = {
    ...defaultProps,
    mainFontFamily: 'Delicious Handrawn',
}

export default storyConfig
