import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
} from 'config/integrations/index'
import {
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'

import {PositionAxis} from '../../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import AutoResponder from '../AutoResponder'
import ChatIntegrationPreview from '../ChatIntegrationPreview'
import MessageContent from '../MessageContent'
import OptionalEmailCapture from '../OptionalEmailCapture'
import RequiredEmailCapture from '../RequiredEmailCapture'

const mainColor = '#123456'
const conversationColor = '#456789'
const currentUser = fromJS({name: 'Charles'})

describe('<ChatIntegrationPreview/>', () => {
    describe('render()', () => {
        const minProps: Omit<
            ComponentProps<typeof ChatIntegrationPreview>,
            'children'
        > = {
            name: 'My little chat integration',
            mainColor: mainColor,
            isOnline: true,
            currentUser: currentUser,
            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
            position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
            introductionText: 'intro',
        }

        const messageContentMinProps: ComponentProps<typeof MessageContent> = {
            conversationColor: conversationColor,
            currentUser: currentUser,
            customerInitialMessages: [],
            agentMessages: [{content: 'test', isHtml: false, attachments: []}],
        }

        it('should display the avatar team picture in the header because the URL is set and the option is enabled', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    avatarType={GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE}
                    avatarTeamPictureUrl="https://gorgias.io/avatar.png"
                >
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should not display button if hideButton provided', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps} hideButton>
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the online status because chat is online', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps}>
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the offline status because chat is offline', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps} isOnline={false}>
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display optional email capture', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps}>
                    <OptionalEmailCapture
                        conversationColor={conversationColor}
                        name="My little chat integration"
                        language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display required email capture', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps} renderFooter={false}>
                    <RequiredEmailCapture
                        conversationColor={conversationColor}
                        language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                        name="My little chat integration"
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the sliders when editing the position', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps} currentUser={currentUser}>
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display auto responder', () => {
            const component = shallow(
                <ChatIntegrationPreview {...minProps} renderFooter={false}>
                    <AutoResponder
                        conversationColor={conversationColor}
                        language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                        name="My little chat integration"
                        autoResponderReply={CHAT_AUTO_RESPONDER_REPLY_DEFAULT}
                    />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display display the offsets when editing axis x', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    position={{
                        ...GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                        offsetX: 1000,
                    }}
                    renderFooter={false}
                    editedPositionAxis={PositionAxis.AXIS_X}
                >
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display display the offsets when editing axis y', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    renderFooter={false}
                    editedPositionAxis={PositionAxis.AXIS_Y}
                >
                    <MessageContent {...messageContentMinProps} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it.each([
            CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
            CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
            CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
        ])(
            'should display typical response time for %s',
            (autoResponderReply) => {
                const component = shallow(
                    <ChatIntegrationPreview
                        {...minProps}
                        renderFooter={false}
                        editedPositionAxis={PositionAxis.AXIS_Y}
                        autoResponderEnabled
                        autoResponderReply={autoResponderReply}
                    >
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                )

                expect(component).toMatchSnapshot()
            }
        )
    })
})
