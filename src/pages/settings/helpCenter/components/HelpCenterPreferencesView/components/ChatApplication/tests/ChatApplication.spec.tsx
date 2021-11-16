import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {fireEvent, waitFor} from '@testing-library/react'

import {getHelpCentersResponseFixture} from '../../../../../fixtures/getHelpCentersResponse.fixture'

import {ChatApplication} from '../ChatApplication'
import {HelpCenter} from '../../../../../../../../models/helpCenter/types'
import {getLocalesResponseFixture as LOCALE_LIST} from '../../../../../fixtures/getLocalesResponse.fixtures'
import {renderWithRouter} from '../../../../../../../../utils/testing'
import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {initialState as uiState} from '../../../../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../../../../state/helpCenter/categories/reducer'
import {initialState as articlesState} from '../../../../../../../../state/helpCenter/articles/reducer'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const mockedUpdatePreferences = jest.fn()
const mockedOnChangeLocale = jest.fn()

const helpCenter: HelpCenter = {
    ...getHelpCentersResponseFixture.data[0],
}

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': helpCenter,
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
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

jest.mock('../../../../../providers/HelpCenterPreferencesSettings', () => ({
    useHelpCenterPreferencesSettings: () => ({
        preferences: {
            chat_application_id: null,
            name: 'my-help-center',
            defaultLanguage: 'en-US',
            availableLanguages: ['en-US', 'fr-FR'],
            translation: {
                created_datetime: '2021-05-17T18:21:42.022Z',
                updated_datetime: '2021-05-17T18:21:42.022Z',
                help_center_id: 1,
                locale: 'en-US',
                seo_meta: {
                    title: null,
                    description: null,
                },
                chat_application_id: null,
            },
        },
        updatePreferences: mockedUpdatePreferences,
    }),
}))

const route = {
    path: '/app/settings/help-center/:helpcenterId/preferences',
    route: '/app/settings/help-center/1/preferences',
}

describe('<ChatApplication />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('allows to enable chat widget and selects the first chat by default', async () => {
        const {container, getByText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ChatApplication
                    helpCenter={helpCenter}
                    availableLocales={LOCALE_LIST}
                    viewLanguage="en-US"
                    onChangeLocale={mockedOnChangeLocale}
                />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()

        await waitFor(() => {
            fireEvent.click(getByText('Enable chat widget'))
        })

        expect(mockedUpdatePreferences).toHaveBeenLastCalledWith({
            translation: {
                created_datetime: '2021-05-17T18:21:42.022Z',
                updated_datetime: '2021-05-17T18:21:42.022Z',
                help_center_id: 1,
                locale: 'en-US',
                seo_meta: {
                    title: null,
                    description: null,
                },
                chat_application_id: 1,
            },
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
                <ChatApplication
                    helpCenter={helpCenter}
                    availableLocales={LOCALE_LIST}
                    viewLanguage="en-US"
                    onChangeLocale={mockedOnChangeLocale}
                />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })
})
