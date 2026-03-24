import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useApplications } from 'models/integration/queries'
import { contactInfoFixture } from 'pages/settings/helpCenter/fixtures/contactInfo.fixture'
import { useHelpCenterTranslation } from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ChatApplication from '../ChatApplication'

const queryClient = mockQueryClient()

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const mockedUpdateTranslation = jest.fn()

const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        settings: [
            {
                data: {
                    business_hours: [
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '9:00',
                            to_time: '11:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '14:00',
                            to_time: '16:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '8:00',
                            to_time: '12:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '13:00',
                            to_time: '17:30',
                        },
                    ],
                    timezone: 'UTC',
                },
                id: 2,
                type: 'business-hours',
            },
        ],
    }),
    ui: {
        contactForm: {
            currentId: 1,
        },
        helpCenter: {
            currentLanguage: 'en-US',
            currentId: 1,
        },
        editor: {
            isEditingLink: false,
            isFocused: false,
        },
        stats: {
            fetchingMap: {},
            isFilterDirty: false,
            cleanStatsFilters: null,
        },
        ticketNavbar: {
            optimisticAccountSettings: {
                views: {},
                view_sections: {},
                views_top: {},
                views_bottom: {},
            },
            optimisticUserSettings: {
                views: {},
                view_sections: {},
            },
        },
        views: {
            activeViewId: 1,
        },
        selfServiceConfigurations: {
            loading: false,
        },
    },
    integrations: fromJS({
        integrations: [
            {
                meta: {
                    app_id: '1',
                    language: 'en-US',
                    languages: [
                        {
                            language: 'fr-FR',
                        },
                        {
                            language: 'en-US',
                            primary: true,
                        },
                    ],
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
                    languages: [
                        {
                            language: 'fr-FR',
                        },
                        {
                            language: 'en-US',
                            primary: true,
                        },
                    ],
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
                    languages: [
                        {
                            language: 'fr-FR',
                        },
                        {
                            language: 'en-US',
                            primary: true,
                        },
                    ],
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
} as unknown as RootState

jest.mock(
    '../../../../../providers/HelpCenterTranslation/HelpCenterTranslation',
)
jest.mock('../../../../../../../../models/integration/queries')

const route = {
    path: '/app/settings/help-center/:helpcenterId/contact',
    route: '/app/settings/help-center/1/contact',
}

describe('<ChatApplication />', () => {
    beforeEach(() => {
        queryClient.clear()
        jest.resetAllMocks()
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatAppKey: null,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: mockedUpdateTranslation,
        })
        ;(useApplications as jest.Mock).mockReturnValue({
            data: {
                applications: [
                    {
                        id: 1,
                        appKey: 'app-key',
                    },
                ],
            },
            isSuccess: true,
        })
    })

    it('allows to enable chat widget and selects the first chat by default', async () => {
        const { container, getByLabelText } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore(defaultState)}>
                    <ChatApplication />
                </Provider>
            </QueryClientProvider>,
            route,
        )

        expect(container).toMatchSnapshot()

        await waitFor(() => {
            fireEvent.click(
                getByLabelText('Enable chat widget', { exact: false }),
            )
        })

        expect(mockedUpdateTranslation).toHaveBeenLastCalledWith(
            expect.objectContaining({
                chatAppKey: 'app-key',
            }),
        )
    })

    it('is disabled if there are no chat integrations', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockedStore({
                        ...defaultState,
                        integrations: fromJS({
                            integrations: [],
                        }),
                    })}
                >
                    <ChatApplication />
                </Provider>
            </QueryClientProvider>,
            route,
        )

        expect(container).toMatchSnapshot()
    })
})
