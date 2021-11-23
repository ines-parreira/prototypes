import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

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

jest.mock('../../../../../providers/HelpCenterTranslation', () => ({
    useHelpCenterTranslation: () => ({
        translation: {
            chat_application_id: null,
            contact_info: {
                email: {
                    description: '',
                    enabled: false,
                    email: '',
                },
                phone: {
                    description: '',
                    enabled: false,
                    phone_numbers: '',
                },
                chat: {
                    description: '',
                    enabled: false,
                },
            },
        },
        updateTranslation: mockedUpdateTranslation,
    }),
}))

const route = {
    path: '/app/settings/help-center/:helpcenterId/contact',
    route: '/app/settings/help-center/1/contact',
}

describe('<ChatApplication />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('allows to enable chat widget and selects the first chat by default', async () => {
        const {container, getByText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()

        await waitFor(() => {
            fireEvent.click(getByText('Enable chat widget'))
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
                <ChatApplication />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
