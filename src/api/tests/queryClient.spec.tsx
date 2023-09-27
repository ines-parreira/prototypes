import {QueryClientProvider, useQuery} from '@tanstack/react-query'
import {act, renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {waitFor} from '@testing-library/react'
import {appQueryClient} from 'api/queryClient'
import {store as reduxStore} from 'init'

jest.mock('init')
jest.mock('state/queries/actions', () => ({
    updateQueryTimestamp: jest.fn((arg: unknown) => arg),
}))

jest.mock(
    'api/queryClient',
    () =>
        ({
            ...jest.requireActual('api/queryClient'),
        } as Record<string, unknown>)
)

describe('queryClient', () => {
    it('should update query timestamp on success', async () => {
        renderHook(
            () =>
                useQuery({
                    queryKey: ['test'],
                    queryFn: () => Promise.resolve('test'),
                }),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={appQueryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )

        await act(() =>
            waitFor(() =>
                expect(reduxStore.dispatch).toHaveBeenCalledWith(['test'])
            )
        )
    })
})
