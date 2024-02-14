import React, {ReactNode} from 'react'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {createBrowserHistory, History} from 'history'
import {Router, Route} from 'react-router-dom'
import {render} from '@testing-library/react'
import {FACEBOOK_INTEGRATION_TYPE} from 'constants/integration'

import FacebookIntegrationList from '../FacebookIntegrationList'

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

describe('<FacebookIntegrationList />', () => {
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
        const {container} = render(
            <RouterWrapper>
                <Provider store={store}>
                    <FacebookIntegrationList
                        loading={fromJS({})}
                        redirectUri="https://.../"
                    />
                </Provider>
            </RouterWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
