import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {CHAT_AUTO_RESPONDER_REPLY_DEFAULT} from '../../../../../../../config/integrations/index.ts'
import {
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
} from '../../../../../../../config/integrations/smooch_inside.ts'

import AutoResponder from '../AutoResponder.tsx'
import ChatIntegrationPreview from '../ChatIntegrationPreview.tsx'
import MessageContent from '../MessageContent.tsx'
import OptionalEmailCapture from '../OptionalEmailCapture.tsx'
import QuickReplies from '../QuickReplies.tsx'
import RequiredEmailCapture from '../RequiredEmailCapture.tsx'

const mainColor = '#123456'
const conversationColor = '#456789'
const currentUser = fromJS({name: 'Charles'})

describe('<ChatIntegrationPreview/>', () => {
    describe('render()', () => {
        it('should display the avatar team picture in the header because the URL is set and the option is enabled', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    currentUser={currentUser}
                    introductionText="intro"
                    mainColor={mainColor}
                    isOnline={true}
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    avatarType={SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE}
                    avatarTeamPictureUrl="https://gorgias.io/avatar.png"
                >
                    <MessageContent
                        conversationColor={conversationColor}
                        currentUser={currentUser}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the online status because chat is online', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    currentUser={currentUser}
                    introductionText="intro"
                    mainColor={mainColor}
                    isOnline={true}
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <MessageContent
                        conversationColor={conversationColor}
                        currentUser={currentUser}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the offline status because chat is offline', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    currentUser={currentUser}
                    introductionText="intro"
                    mainColor={mainColor}
                    isOnline={false}
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <MessageContent
                        conversationColor={conversationColor}
                        currentUser={currentUser}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display quickReplies', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    introductionText="intro"
                    mainColor={mainColor}
                    isOnline
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <QuickReplies
                        quickReplies={fromJS(['foo', 'bar'])}
                        mainColor={mainColor}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display optional email capture', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    introductionText="intro"
                    mainColor="#123456"
                    conversationColor="#456789"
                    optionalEmailCapture={true}
                    isOnline
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <OptionalEmailCapture
                        conversationColor={conversationColor}
                        name="My little chat integration"
                        language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display required email capture', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    introductionText="intro"
                    mainColor="#123456"
                    conversationColor="#456789"
                    requiredEmailCapture={true}
                    isOnline
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    renderFooter={false}
                >
                    <RequiredEmailCapture
                        conversationColor={conversationColor}
                        language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display auto responder', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    name="My little chat integration"
                    introductionText="intro"
                    mainColor="#123456"
                    conversationColor="#456789"
                    requiredEmailCapture={true}
                    isOnline
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    renderFooter={false}
                >
                    <AutoResponder
                        conversationColor={conversationColor}
                        language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                        name="My little chat integration"
                        autoResponderReply={CHAT_AUTO_RESPONDER_REPLY_DEFAULT}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
