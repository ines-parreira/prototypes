import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AttachmentEnum } from 'common/types'
import {
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
} from 'config/integrations'
import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'
import { billingState } from 'fixtures/billing'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import { PositionAxis } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/types'
import { SETTING_TYPE_BUSINESS_HOURS } from 'state/currentAccount/constants'
import type { RootState, StoreDispatch } from 'state/types'

import AutoResponder from '../AutoResponder'
import ChatIntegrationPreview from '../ChatIntegrationPreview'
import MessageContent from '../MessageContent'
import OptionalEmailCapture from '../OptionalEmailCapture'
import RequiredEmailCapture from '../RequiredEmailCapture'

const mainColor = '#123456'
const conversationColor = '#456789'
const currentUser = fromJS({ name: 'Charles' })

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ConversationTimestamp.tsx',
    () => () => <div>ConversationTimestampMock</div>,
)

const defaultState = {
    currentAccount: fromJS({
        settings: [
            {
                type: SETTING_TYPE_BUSINESS_HOURS,
                data: {
                    business_hours: [
                        {
                            days: '2',
                            from_time: '10:00',
                            to_time: '17:00',
                        },
                        {
                            days: '4',
                            from_time: '11:00',
                            to_time: '17:00',
                        },
                    ],
                    timezone: 'US/Pacific',
                },
            },
        ],
    }),
    billing: fromJS(billingState),
} as RootState

describe('<Provider store={mockStore(defaultState)}><ChatIntegrationPreview/>', () => {
    describe('render()', () => {
        const minProps: Omit<
            ComponentProps<typeof ChatIntegrationPreview>,
            'children'
        > = {
            name: 'My little chat integration',
            mainColor: mainColor,
            mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
            isOnline: true,
            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
            position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
            introductionText: 'intro',
            avatar: {
                imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
                nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            },
            displayBotLabel: true,
            useMainColorOutsideBusinessHours: false,
        }

        const messageContentMinProps: ComponentProps<typeof MessageContent> = {
            conversationColor: conversationColor,
            currentUser: currentUser,
            customerInitialMessages: [],
            agentMessages: [
                { content: 'test', isHtml: false, attachments: [] },
            ],
        }

        it('should display the avatar team picture in the header because the URL is set and the option is enabled', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps}>
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not display button if hideButton provided', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps} hideButton>
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display the online status because chat is online', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps}>
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display the offline status because chat is offline', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps} isOnline={false}>
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display optional email capture', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps}>
                        <OptionalEmailCapture
                            mainColor={mainColor}
                            chatTitle="My little chat integration"
                            language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                        />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display required email capture', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps} renderFooter={false}>
                        <RequiredEmailCapture
                            language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                            name="My little chat integration"
                        />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display the sliders when editing the position', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps}>
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display auto responder', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview {...minProps} renderFooter={false}>
                        <AutoResponder
                            language={GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT}
                            chatTitle="My little chat integration"
                            autoResponderReply={
                                CHAT_AUTO_RESPONDER_REPLY_DEFAULT
                            }
                        />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display display the offsets when editing axis x', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
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
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display display the offsets when editing axis y', () => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview
                        {...minProps}
                        renderFooter={false}
                        editedPositionAxis={PositionAxis.AXIS_Y}
                    >
                        <MessageContent {...messageContentMinProps} />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display display product cards', () => {
            const { getByText } = render(
                <Provider store={mockStore(defaultState)}>
                    <ChatIntegrationPreview
                        {...minProps}
                        renderFooter={false}
                        editedPositionAxis={PositionAxis.AXIS_Y}
                    >
                        <MessageContent
                            {...{
                                ...messageContentMinProps,
                                agentMessages: [
                                    {
                                        content: 'Here are my recommendations',
                                        isHtml: false,
                                        attachments: [
                                            {
                                                content_type:
                                                    AttachmentEnum.Product,
                                                name: 'ADIDAS | SUPERSTAR 80S',
                                                size: 0,
                                                url: 'https://test.com/products/test-product1',
                                                extra: {
                                                    price: '120.5',
                                                    variant_name:
                                                        'ADIDAS | SUPERSTAR 80S',
                                                    product_link:
                                                        'https://test.com/products/test-product1',
                                                    currency: 'USD',
                                                    featured_image:
                                                        'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
                                                    product_id: 1,
                                                    variant_id: 2,
                                                },
                                            },
                                        ],
                                    },
                                ],
                            }}
                        />
                    </ChatIntegrationPreview>
                </Provider>,
            )

            expect(getByText('ADIDAS | SUPERSTAR 80S')).toBeInTheDocument()
            expect(getByText('$120.50')).toBeInTheDocument()
        })

        it.each([
            CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
            CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
            CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
        ])(
            'should display typical response time for %s',
            (autoResponderReply) => {
                const { container } = render(
                    <Provider store={mockStore(defaultState)}>
                        <ChatIntegrationPreview
                            {...minProps}
                            renderFooter={false}
                            editedPositionAxis={PositionAxis.AXIS_Y}
                            autoResponderEnabled
                            autoResponderReply={autoResponderReply}
                        >
                            <MessageContent {...messageContentMinProps} />
                        </ChatIntegrationPreview>
                    </Provider>,
                )

                expect(container.firstChild).toMatchSnapshot()
            },
        )
    })
})
