import React from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import { renderHook } from '../renderHook'

jest.mock('react-dnd', () => ({
    DndProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

jest.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    Toaster: () => <div data-testid="toaster" />,
}))

type StoreState = {
    account: {
        name: string
    }
}

describe('renderHook', () => {
    it('renders with the shared Helpdesk providers and returns the store', () => {
        const ExtraWrapper = ({ children }: React.PropsWithChildren) => (
            <>{children}</>
        )

        const { result, store } = renderHook<undefined, unknown, StoreState>(
            () => {
                const accountName = useSelector<StoreState, string>(
                    (state) => state.account.name,
                )
                const location = useLocation()
                const params = useParams<{ id: string }>()
                const queryClient = useQueryClient()

                return {
                    accountName,
                    pathname: location.pathname,
                    queryRetry: queryClient.getDefaultOptions().queries?.retry,
                    ticketId: params.id,
                }
            },
            {
                initialEntries: ['/tickets/42'],
                path: '/tickets/:id',
                queryClientOptions: {
                    queries: {
                        retry: true,
                    },
                },
                storeState: {
                    account: {
                        name: 'Gorgias',
                    },
                },
                wrapper: ExtraWrapper,
            },
        )

        expect(result.current).toEqual({
            accountName: 'Gorgias',
            pathname: '/tickets/42',
            queryRetry: true,
            ticketId: '42',
        })
        expect(store.getState()).toEqual({
            account: {
                name: 'Gorgias',
            },
        })
    })

    it('uses default provider options when no options are passed', () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()

            return queryClient.getDefaultOptions().queries?.retry
        })

        expect(result.current).toBe(false)
    })
})
