import React from 'react'

import { renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router-dom'

import { renderHookWithRouter } from 'tests/renderHookWithRouter'

import { usePreviousProductNavigation } from '../usePreviousProductNavigation'

const createWrapper =
    (initialEntries: string[]) =>
    ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={initialEntries}>
            <Link to="/app/tickets/123">Ticket123</Link>
            <Link to="/app/customers">Customers</Link>
            <Link to="/app/settings/">SettingsOverview</Link>
            <Link to="/app/settings/specific">SettingsSpecific</Link>
            <div>{children}</div>
        </MemoryRouter>
    )

describe('usePreviousProductNavigation', () => {
    describe('initial state', () => {
        it('returns current pathname when starting on a non-sticky product', () => {
            const { result } = renderHookWithRouter(
                () => usePreviousProductNavigation(),
                { initialEntries: ['/app/tickets'] },
            )

            expect(result.current).toBe('/app/tickets')
        })

        it('returns null when starting on a sticky product', () => {
            const { result } = renderHookWithRouter(
                () => usePreviousProductNavigation(),
                { initialEntries: ['/app/settings'] },
            )

            expect(result.current).toBeNull()
        })
    })

    describe('navigation behavior', () => {
        it('preserves last non-sticky path when navigating to or between a sticky product', async () => {
            const user = userEvent.setup()
            const { result } = renderHook(usePreviousProductNavigation, {
                wrapper: createWrapper(['/app/tickets']),
            })

            await user.click(screen.getByRole('link', { name: 'Ticket123' }))
            await user.click(
                screen.getByRole('link', { name: 'SettingsOverview' }),
            )
            await user.click(
                screen.getByRole('link', { name: 'SettingsSpecific' }),
            )

            expect(result.current).toBe('/app/tickets/123')
        })

        it('updates the tracked path when navigating between non-sticky products', async () => {
            const user = userEvent.setup()
            const { result, rerender } = renderHook(
                usePreviousProductNavigation,
                {
                    wrapper: createWrapper(['/app/tickets']),
                },
            )

            await user.click(screen.getByRole('link', { name: 'Customers' }))

            rerender()

            expect(result.current).toBe('/app/customers')
        })
    })
})
