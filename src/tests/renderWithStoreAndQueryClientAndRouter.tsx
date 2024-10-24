import {render} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React, {ReactElement} from 'react'
import {Provider} from 'react-redux'
import {Route, Router} from 'react-router-dom'

import {RootState} from 'state/types'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {mockStore} from 'utils/testing'

export const renderWithStoreAndQueryClientAndRouter = (
    element: ReactElement,
    state: Partial<RootState> = {}
) => {
    const store = mockStore(state)
    const MockQueryClientProvider = mockQueryClientProvider()
    const history = createMemoryHistory({initialEntries: ['/']})
    return {
        ...render(element, {
            wrapper: ({children}: any) => (
                <Provider store={store}>
                    <MockQueryClientProvider>
                        <Router history={history}>
                            <Route path="/">{children}</Route>
                        </Router>
                    </MockQueryClientProvider>
                </Provider>
            ),
        }),
        store,
        history,
    }
}
