import React, { ReactElement } from 'react'

import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

export const renderWithQueryClientAndRouter = (
    element: ReactElement,
    route: string = '/',
) => {
    const MockQueryClientProvider =
        mockQueryClientProvider().QueryClientProvider
    const history = createMemoryHistory({ initialEntries: [route] })
    return {
        ...render(element, {
            wrapper: ({ children }: any) => (
                <MockQueryClientProvider>
                    <Router history={history}>
                        <Route path="/">{children}</Route>
                    </Router>
                </MockQueryClientProvider>
            ),
        }),
        history,
    }
}
