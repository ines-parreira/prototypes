import type { ReactElement } from 'react'

import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { createPortal } from 'react-dom'
import { Route, Router } from 'react-router-dom'

import { Toaster } from '@gorgias/axiom'

import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

const toaster = createPortal(<Toaster />, document.body)

/**
 * @deprecated Use `render` from `@repo/testing` instead.
 */
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
                <>
                    <MockQueryClientProvider>
                        <Router history={history}>
                            <Route path="/">{children}</Route>
                        </Router>
                    </MockQueryClientProvider>
                    {toaster}
                </>
            ),
        }),
        history,
    }
}
