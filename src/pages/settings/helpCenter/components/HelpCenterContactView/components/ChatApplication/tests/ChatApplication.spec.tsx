import React from 'react'
import {fireEvent, waitFor, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {contactInfoFixture} from 'pages/settings/helpCenter/fixtures/contactInfo.fixture'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {useChatHelpCenterConfiguration} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfService/hooks'

import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {renderWithRouter} from '../../../../../../../../utils/testing'
import ChatApplication from '../ChatApplication'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const mockedUpdateTranslation = jest.fn()

const defaultState: Partial<RootState> = {
    integrations: fromJS({
        integrations: [
            {
                meta: {
                    app_id: '1',
                    language: 'en-US',
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: 'reply-shortly',
                        },
                        email_capture_enforcement: 'optional',
                    },
                    shop_integration_id: 8,
                    shop_name: 'matthieu-b-rubber-ducks',
                    shop_type: 'shopify',
                    shopify_integration_ids: [],
                },
                name: 'testchat',
                uri: '/api/integrations/10/',
                created_datetime: '2021-10-11T14:13:47.984167+00:00',
                type: 'gorgias_chat',
                id: 10,
                updated_datetime: '2021-10-26T12:01:17.305807+00:00',
            },
            {
                meta: {
                    app_id: '2',
                    language: 'en-US',
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: 'reply-shortly',
                        },
                        email_capture_enforcement: 'optional',
                    },
                    shop_integration_id: 8,
                    shop_name: 'matthieu-b-rubber-ducks',
                    shop_type: 'shopify',
                },
                name: 'another chat',
                uri: '/api/integrations/11/',
                created_datetime: '2021-11-08T09:48:30.484260+00:00',
                type: 'gorgias_chat',
                id: 11,
                updated_datetime: '2021-11-08T09:48:30.484278+00:00',
            },
            {
                meta: {
                    app_id: '3',
                    language: 'en-US',
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: 'reply-shortly',
                        },
                        email_capture_enforcement: 'optional',
                    },
                    shop_integration_id: 8,
                    shop_name: 'matthieu-b-rubber-ducks',
                    shop_type: 'shopify',
                },
                name: 'disabled chat',
                uri: '/api/integrations/11/',
                created_datetime: '2021-11-08T09:48:30.484260+00:00',
                deactivated_datetime: '2021-11-08T09:48:30.484260+00:00',
                type: 'gorgias_chat',
                id: 12,
                updated_datetime: '2021-11-08T09:48:30.484278+00:00',
            },
        ],
    }),
}

jest.mock('../../../../../providers/HelpCenterTranslation')
jest.mock(
    '../../../../../../../integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfService/hooks'
)

const route = {
    path: '/app/settings/help-center/:helpcenterId/contact',
    route: '/app/settings/help-center/1/contact',
}

describe('<ChatApplication />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: null,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useChatHelpCenterConfiguration as jest.Mock).mockReturnValue({
            chatHelpCenterConfiguration: null,
            setChatHelpCenterConfiguration: jest.fn(),
        })
    })

    it('allows to enable chat widget and selects the first chat by default', async () => {
        const {container, getByLabelText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()

        await waitFor(() => {
            fireEvent.click(getByLabelText('Enable chat widget'))
        })

        expect(mockedUpdateTranslation).toHaveBeenLastCalledWith({
            chatApplicationId: 1,
        })
    })

    it('is disabled if there are no chat integrations', () => {
        const {container} = renderWithRouter(
            <Provider
                store={mockedStore({
                    ...defaultState,
                    integrations: fromJS({
                        integrations: [],
                    }),
                })}
            >
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })

    it('show alert if the chat application id does not match the one for the article recommendation', () => {
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: 1,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useChatHelpCenterConfiguration as jest.Mock).mockReturnValue({
            chatHelpCenterConfiguration: {
                chat_application_id: 1,
                enabled: true,
                help_center_id: 2,
                id: 2,
            },
            setChatHelpCenterConfiguration: jest.fn(),
        })
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        screen.getByText(
            'The selected chat integration is using a different Help Center for article recommendations.'
        )
        const chatIntegrationLink = screen.getByText(
            'Go To Chat Settings'
        ) as HTMLAnchorElement
        expect(chatIntegrationLink.getAttribute('to')).toStrictEqual(
            '/app/settings/integrations/gorgias_chat/10/automation'
        )
    })

    it('does not show alert if the chat application id matches the one for the article recommendation', () => {
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: 1,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useChatHelpCenterConfiguration as jest.Mock).mockReturnValue({
            chatHelpCenterConfiguration: {
                chat_application_id: 1,
                enabled: true,
                help_center_id: 1,
                id: 2,
            },
            setChatHelpCenterConfiguration: jest.fn(),
        })
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        expect(
            screen.queryByText(
                'The selected chat integration is using a different Help Center for article recommendations.'
            )
        ).toBeNull()
    })

    it('does not show alert if the chat help center configuration is not enabled', () => {
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: 1,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useChatHelpCenterConfiguration as jest.Mock).mockReturnValue({
            chatHelpCenterConfiguration: {
                chat_application_id: 1,
                enabled: false,
                help_center_id: 2,
                id: 2,
            },
            setChatHelpCenterConfiguration: jest.fn(),
        })
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        expect(
            screen.queryByText(
                'The selected chat integration is using a different Help Center for article recommendations.'
            )
        ).toBeNull()
    })

    it('does not show alert if the chat help center configuration does not exist', () => {
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: 1,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useChatHelpCenterConfiguration as jest.Mock).mockReturnValue({
            chatHelpCenterConfiguration: null,
            setChatHelpCenterConfiguration: jest.fn(),
        })
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication helpCenterId={1} />
            </Provider>,
            route
        )

        expect(
            screen.queryByText(
                'The selected chat integration is using a different Help Center for article recommendations.'
            )
        ).toBeNull()
    })
})
