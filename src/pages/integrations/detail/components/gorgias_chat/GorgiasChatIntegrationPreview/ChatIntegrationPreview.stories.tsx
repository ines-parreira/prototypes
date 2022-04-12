import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {user} from 'fixtures/users'

import QuickResponseReplies from 'pages/settings/selfService/components/QuickResponseFlowItem/components/QuickResponseReplies/QuickResponseReplies'
import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'
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
    isOnline: true,
    children: (
        <MessageContent
            conversationColor=""
            currentUser={fromJS(user)}
            customerInitialMessages={['Hello']}
            agentMessages={[{content: 'Nice to meet you', isHtml: false}]}
        />
    ),
    introductionText: 'How can we help?',
    autoResponderEnabled: true,
    autoResponderReply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
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

export const WithQuickReplies = Template.bind({})
WithQuickReplies.args = {
    ...defaultProps,
    children: (
        <>
            <MessageContent
                conversationColor=""
                currentUser={fromJS(user)}
                customerInitialMessages={['Hello']}
                agentMessages={[{content: 'Nice to meet you', isHtml: false}]}
            />
            <QuickResponseReplies
                quickReplies={['Yes, thank you', 'No, I need more help']}
                mainColor={defaultProps.mainColor}
            />
        </>
    ),
}

export default storyConfig
