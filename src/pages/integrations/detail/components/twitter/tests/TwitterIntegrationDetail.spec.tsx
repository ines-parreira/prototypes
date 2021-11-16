import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from '../../../../../../models/integration/types'
import TwitterIntegrationDetail from '../TwitterIntegrationDetail'

describe('<TwitterIntegrationDetail/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    let updateOrCreateIntegration: jest.MockedFunction<any>
    let deleteIntegration: jest.MockedFunction<any>
    let integration: Map<string, any>

    beforeEach(() => {
        updateOrCreateIntegration = jest.fn()
        deleteIntegration = jest.fn()

        integration = fromJS({
            id: 1,
            name: 'Fake twitter integration',
            description: '@faketwitterintegration',
            type: IntegrationType.Twitter,
            meta: {
                about: 'Foo bar',
                picture: 'https://some-random-url.com/picture.jpeg',
                settings: {
                    mentions_enabled: false,
                    tweets_replies_enabled: false,
                    direct_messages_enabled: false,
                },
            },
        })

        // Bootstrap uses the current date to generate an ID for each button that is linked to a popover
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1615240000000)
    })

    afterEach(() => {
        jest.clearAllMocks()
        ;((global.Date.now as unknown) as jest.SpyInstance).mockRestore()
    })

    describe('render()', () => {
        it.each(['acme', 'test-martin', 'mehdi17091993', 'foo'])(
            'should render',
            (domainName) => {
                const store = mockStore({
                    currentAccount: fromJS({domain: domainName}),
                })

                const {container} = render(
                    <TwitterIntegrationDetail
                        integration={integration}
                        actions={{updateOrCreateIntegration, deleteIntegration}}
                        redirectUri="https://this-is-an-url.com"
                    />,
                    {
                        wrapper: (props) => (
                            <Provider store={store}>
                                <BrowserRouter>{props?.children}</BrowserRouter>
                            </Provider>
                        ),
                    }
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
