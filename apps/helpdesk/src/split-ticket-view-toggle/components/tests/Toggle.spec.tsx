import type React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'

import { store } from 'common/store'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'

import Toggle from '../Toggle'

jest.mock('@repo/logging')
jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag', () => ({
    useDesktopOnlyShowGlobalNavFeatureFlag: jest.fn(() => true),
}))

const mockUseHelpdeskV2MS1Flag = jest.fn()
jest.mock('@repo/tickets/feature-flags', () => ({
    useHelpdeskV2MS1Flag: () => mockUseHelpdeskV2MS1Flag(),
}))

describe('Toggle', () => {
    const renderWithProvider = (
        component: React.ReactNode,
        initialRoute = '/tickets/123',
    ) => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Provider store={store}>
                    <SplitTicketViewProvider>
                        <Route path="/tickets/:ticketId">{component}</Route>
                    </SplitTicketViewProvider>
                </Provider>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpdeskV2MS1Flag.mockReturnValue(false)
        localStorage.clear()
    })

    describe('Legacy UI (hasUIVisionMS1 = false)', () => {
        it('should render the toggle button', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })

        it('should have data-candu-id attribute', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-candu-id', 'dtp-toggle')
        })

        it('should toggle aria-describedby on click', async () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            const initialLabel = button.getAttribute('aria-describedby')

            await act(() => userEvent.click(button))

            const toggledLabel = button.getAttribute('aria-describedby')
            expect(toggledLabel).not.toBe(initialLabel)

            await act(() => userEvent.click(button))

            expect(button.getAttribute('aria-describedby')).toBe(initialLabel)
        })

        it('should toggle active class on click', async () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            const hadActiveClass = button.classList.contains('active')

            await act(() => userEvent.click(button))

            expect(button.classList.contains('active')).toBe(!hadActiveClass)

            await act(() => userEvent.click(button))

            expect(button.classList.contains('active')).toBe(hadActiveClass)
        })

        it('should render with showGlobalNav CSS class', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toHaveClass('showGlobalNavToggle')
        })
    })

    describe('New UI (hasUIVisionMS1 = true)', () => {
        beforeEach(() => {
            mockUseHelpdeskV2MS1Flag.mockReturnValue(true)
        })

        it('should render the Axiom Button component', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })

        it('should have data-candu-id attribute', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-candu-id', 'dtp-toggle')
        })

        it('should toggle aria-describedby on click', async () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            const initialLabel = button.getAttribute('aria-describedby')

            await act(() => userEvent.click(button))

            const toggledLabel = button.getAttribute('aria-describedby')
            expect(toggledLabel).not.toBe(initialLabel)

            await act(() => userEvent.click(button))

            expect(button.getAttribute('aria-describedby')).toBe(initialLabel)
        })

        it('should use Axiom Button styling', () => {
            renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('data-name', 'button')
        })
    })

    describe('Component behavior', () => {
        it('should persist toggle state across re-renders', async () => {
            const { rerender } = renderWithProvider(<Toggle />)

            const button = screen.getByRole('button')
            const initialLabel = button.getAttribute('aria-describedby')

            await act(() => userEvent.click(button))

            rerender(
                <MemoryRouter initialEntries={['/tickets/123']}>
                    <Provider store={store}>
                        <SplitTicketViewProvider>
                            <Route path="/tickets/:ticketId">
                                <Toggle />
                            </Route>
                        </SplitTicketViewProvider>
                    </Provider>
                </MemoryRouter>,
            )

            const newButton = screen.getByRole('button')
            expect(newButton.getAttribute('aria-describedby')).not.toBe(
                initialLabel,
            )
        })
    })
})
