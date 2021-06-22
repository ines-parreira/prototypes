import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from '../../../../../../models/integration/types'

import TwitterIntegrationList from '../TwitterIntegrationList'

describe('<TwitterIntegrationList/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    let integrations: List<Map<string, any>>
    let activateIntegration: jest.MockedFunction<any>
    let deactivateIntegration: jest.MockedFunction<any>

    beforeEach(() => {
        const integration = {
            id: 1,
            type: IntegrationType.TwitterIntegrationType,
            name: 'Fake twitter integration',
            description: '@faketwitterintegration',
            meta: {
                picture: 'https://some-random-url.com/picture.jpeg',
            },
        }
        integrations = fromJS([integration])
        activateIntegration = jest.fn()
        deactivateIntegration = jest.fn()
    })

    describe('render()', () => {
        it('should render with single integration', () => {
            const store = mockStore({
                integrations,
            })

            const {container} = render(
                <TwitterIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
                    actions={{activateIntegration, deactivateIntegration}}
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
        })

        it('should render with empty list', () => {
            integrations = fromJS([])
            const store = mockStore({
                integrations,
            })

            const {container} = render(
                <TwitterIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
                    actions={{activateIntegration, deactivateIntegration}}
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
        })
    })
})
