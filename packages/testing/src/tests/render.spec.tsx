import React from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

import { render } from '../render'

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

const TestingComponent = () => {
    const accountName = useSelector<StoreState, string>(
        (state) => state.account.name,
    )
    const location = useLocation()
    const params = useParams<{ id: string }>()
    const queryClient = useQueryClient()

    return (
        <div>
            <span data-testid="account-name">{accountName}</span>
            <span data-testid="pathname">{location.pathname}</span>
            <span data-testid="ticket-id">{params.id}</span>
            <span data-testid="query-retry">
                {String(queryClient.getDefaultOptions().queries?.retry)}
            </span>
            <button type="button">Open</button>
        </div>
    )
}

describe('render', () => {
    it('renders with the shared Helpdesk providers and returns test utilities', async () => {
        const ExtraWrapper = ({ children }: React.PropsWithChildren) => (
            <section data-testid="extra-wrapper">{children}</section>
        )

        const { store, user } = render<StoreState>(<TestingComponent />, {
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
        })

        expect(screen.getByTestId('extra-wrapper')).toBeTruthy()
        expect(screen.getByTestId('account-name').textContent).toBe('Gorgias')
        expect(screen.getByTestId('pathname').textContent).toBe('/tickets/42')
        expect(screen.getByTestId('ticket-id').textContent).toBe('42')
        expect(screen.getByTestId('query-retry').textContent).toBe('true')

        await user.click(screen.getByRole('button', { name: 'Open' }))

        expect(store.getState()).toEqual({
            account: {
                name: 'Gorgias',
            },
        })
    })

    it('uses default provider options when no options are passed', () => {
        render(<span>Default render</span>)

        expect(screen.getByText('Default render')).toBeTruthy()
    })
})
