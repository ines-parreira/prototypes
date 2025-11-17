import type { ReactElement } from 'react'

import { NavigationProvider } from '@repo/navigation'
import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'

import type { RootState } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import type { RenderWithRouterParams } from 'utils/testing'
import { mockStore } from 'utils/testing'

export const renderWithStoreAndQueryClientAndRouter = (
    element: ReactElement,
    state: Partial<RootState> = {},
    routing: RenderWithRouterParams = {
        options: {},
        path: '/',
        route: '/',
        history: undefined,
    },
) => {
    const store = mockStore(state)
    const MockQueryClientProvider =
        mockQueryClientProvider().QueryClientProvider
    const history =
        routing.history ||
        createMemoryHistory({ initialEntries: [routing.route || '/'] })

    return {
        ...render(element, {
            wrapper: ({ children }: any) => (
                <Provider store={store}>
                    <NavigationProvider>
                        <MockQueryClientProvider>
                            <Router history={history}>
                                <Route path={routing.path}>{children}</Route>
                            </Router>
                        </MockQueryClientProvider>
                    </NavigationProvider>
                </Provider>
            ),
            ...routing.options,
        }),
        store,
        history,
    }
}
