import type { ReactElement } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { Provider } from 'react-redux'

import { Toaster } from '@gorgias/axiom'

import type { RootState } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

const toaster = createPortal(<Toaster />, document.body)

/**
 * @deprecated Use `render` from `@repo/testing` instead.
 */
export const renderWithStoreAndQueryClientProvider = (
    element: ReactElement,
    state: Partial<RootState> = {},
) => {
    const store = mockStore(state)
    const MockQueryClientProvider =
        mockQueryClientProvider().QueryClientProvider
    return {
        ...render(element, {
            wrapper: ({ children }: any) => (
                <>
                    <Provider store={store}>
                        <MockQueryClientProvider>
                            {children}
                        </MockQueryClientProvider>
                    </Provider>
                    {toaster}
                </>
            ),
        }),
        store,
    }
}
