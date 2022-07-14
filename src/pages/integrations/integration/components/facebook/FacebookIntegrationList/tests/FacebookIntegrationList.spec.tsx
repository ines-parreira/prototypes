import React, {ReactNode} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {createBrowserHistory, History} from 'history'
import {Router, Route} from 'react-router-dom'

import {FACEBOOK_INTEGRATION_TYPE} from '../../../../../../../constants/integration'
import {FacebookIntegrationListContainer} from '../FacebookIntegrationList'

const RouterWrapper = ({
    history,
    children,
}: {
    history?: History
    children?: ReactNode
}) => {
    let historyInstance = history
    if (!historyInstance) {
        historyInstance = createBrowserHistory()
        historyInstance.push('/foo/facebook')
    }
    return (
        <Router
            history={{
                ...historyInstance,
                location: {
                    ...historyInstance.location,
                    key: 'KEY',
                },
            }}
        >
            <Route path="/foo/:integrationType">{children}</Route>
        </Router>
    )
}

describe('FacebookIntegrationList component', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)

    const store = mockStore({
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: 'mylittleintegration',
                    type: FACEBOOK_INTEGRATION_TYPE,
                    created_datetime: '2018-01-01 00:00:00',
                    facebook: {
                        name: 'My Page',
                        picture: {
                            data: {
                                url: 'https://fake.url/picture.jpg',
                            },
                        },
                        category: 'Category',
                    },
                },
            ],
        }),
    })

    it('should render', () => {
        const component = shallow(
            <RouterWrapper>
                <Provider store={store}>
                    <FacebookIntegrationListContainer
                        loading={fromJS({})}
                        redirectUri="https://.../"
                        integrations={fromJS([])}
                    />
                </Provider>
            </RouterWrapper>
        )

        expect(component).toMatchSnapshot()
    })
})
