import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {CHAT_AUTO_RESPONDER_REPLY_DEFAULT} from 'config/integrations/index'
import {
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/smooch_inside'

import AutoResponder from '../AutoResponder'
import ChatIntegrationPreview from '../ChatIntegrationPreview'
import MessageContent from '../MessageContent'
import OptionalEmailCapture from '../OptionalEmailCapture'
import QuickReplies from '../QuickReplies'
import RequiredEmailCapture from '../RequiredEmailCapture'

const mainColor = '#123456'
const conversationColor = '#456789'
const currentUser: Map<any, any> = fromJS({name: 'Charles'})

describe('<ChatIntegrationPreview/>', () => {
    const minProps = {
        name: 'My little chat integration',
        mainColor: mainColor,
        isOnline: true,
    } as ComponentProps<typeof ChatIntegrationPreview>

    const minStore: Partial<RootState> = {
        currentUser: currentUser,
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const store = mockStore(minStore)

    describe('render()', () => {
        it('should display the avatar team picture in the header because the URL is set and the option is enabled', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    introductionText="intro"
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                    avatarType={SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE}
                    avatarTeamPictureUrl="https://gorgias.io/avatar.png"
                >
                    <Provider store={store}>
                        <MessageContent conversationColor={conversationColor} />
                    </Provider>
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the online status because chat is online', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    introductionText="intro"
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <Provider store={store}>
                        <MessageContent conversationColor={conversationColor} />
                    </Provider>
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the offline status because chat is offline', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    introductionText="intro"
                    isOnline={false}
                    language={SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT}
                >
                    <MessageContent conversationColor={conversationColor} />
                </ChatIntegrationPreview>
            )

            expect(component).toMatchSnapshot()
        })

        it('should display quickReplies', () => {
            const component = shallow(
                <ChatIntegrationPreview
                    {...minProps}
                    introductionText="intro"
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
                    {...minProps}
                    introductionText="intro"
                    mainColor="#123456"
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
                    {...minProps}
                    introductionText="intro"
                    mainColor="#123456"
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
                    {...minProps}
                    introductionText="intro"
                    mainColor="#123456"
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
