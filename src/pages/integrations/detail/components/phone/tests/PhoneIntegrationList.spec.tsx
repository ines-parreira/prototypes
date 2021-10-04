import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from '../../../../../../models/integration/types'
import {AccountFeature} from '../../../../../../state/currentAccount/types'

import PhoneIntegrationList from '../PhoneIntegrationList'

describe('<PhoneIntegrationList/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    let integrations: List<Map<string, any>>

    function getState(maxIntegrations: number) {
        return {
            currentAccount: fromJS({
                features: {
                    [AccountFeature.PhoneIntegration]: {
                        limit: maxIntegrations,
                    },
                },
            }),
        }
    }

    beforeEach(() => {
        const integration = {
            id: 1,
            type: IntegrationType.PhoneIntegrationType,
            name: 'Fake phone integration',
            meta: {
                emoji: '🍏',
                twilio: {
                    incoming_phone_number: {
                        friendly_name: '(415) 111-2222',
                    },
                },
            },
        }
        integrations = fromJS([integration])
    })

    describe('render()', () => {
        it('should render', () => {
            const store = mockStore(getState(3))

            const {container} = render(
                <PhoneIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
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

        it('should render with a warning message', () => {
            const store = mockStore(getState(2))

            const {container} = render(
                <PhoneIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
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

        it('should render with an error message and without creation button', () => {
            const store = mockStore(getState(1))

            const {container} = render(
                <PhoneIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
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
            const store = mockStore(getState(99))

            const {container} = render(
                <PhoneIntegrationList
                    integrations={integrations}
                    loading={fromJS({})}
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
