import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { mockQueryClientProvider } from './reactQueryTestingUtils'

export const renderHookWithStoreAndQueryClientProvider = <TProps, TResult>(
    callback: (props: TProps) => TResult,
    initialStoreState: Partial<RootState> = {},
) => {
    const { QueryClientProvider, queryClient } = mockQueryClientProvider()
    const store = mockStore(initialStoreState)

    return {
        ...renderHook(callback, {
            wrapper: ({ children }) => (
                <Provider store={store}>
                    <QueryClientProvider>{children}</QueryClientProvider>
                </Provider>
            ),
        }),
        store,
        queryClient,
    }
}
