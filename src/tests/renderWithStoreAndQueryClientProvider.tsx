import React, { ReactElement } from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { RootState } from 'state/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

export const renderWithStoreAndQueryClientProvider = (
    element: ReactElement,
    state: Partial<RootState> = {},
) => {
    const store = mockStore(state)
    const MockQueryClientProvider = mockQueryClientProvider()
    return {
        ...render(element, {
            wrapper: ({ children }: any) => (
                <Provider store={store}>
                    <MockQueryClientProvider>
                        {children}
                    </MockQueryClientProvider>
                </Provider>
            ),
        }),
        store,
    }
}
