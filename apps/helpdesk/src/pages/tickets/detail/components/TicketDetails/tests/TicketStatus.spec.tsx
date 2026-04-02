import type { ComponentProps } from 'react'
import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TicketStatus from '../TicketStatus'

describe('TicketStatus component', () => {
    const renderComponent = (
        props: Partial<ComponentProps<typeof TicketStatus>> = {},
    ) => {
        const minProps: ComponentProps<typeof TicketStatus> = {
            setQuickStatus: jest.fn(),
            currentStatus: 'closed',
            ...props,
        }

        return {
            ...render(<TicketStatus {...minProps} />),
            props: minProps,
        }
    }

    it('renders a close button for open tickets and updates the status on click', async () => {
        const user = userEvent.setup({ skipHover: true })
        const { props } = renderComponent({
            currentStatus: 'open',
        })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /close/i }))
        })

        expect(props.setQuickStatus).toHaveBeenCalledWith('open')
    })

    it('renders a reopen button for closed tickets and updates the status on click', async () => {
        const user = userEvent.setup({ skipHover: true })
        const { props } = renderComponent()

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /reopen/i }))
        })

        expect(props.setQuickStatus).toHaveBeenCalledWith('closed')
    })

    it('shows the action shortcut in a tooltip for enabled actions', async () => {
        const user = userEvent.setup()

        renderComponent({
            currentStatus: 'open',
        })

        const button = screen.getByRole('button', { name: /close/i })

        await act(async () => {
            await user.hover(button)
        })

        expect(await screen.findByText('Close (press C)')).toBeInTheDocument()

        await act(async () => {
            await user.unhover(button)
        })
    })

    it('disables the action and shows the standalone tooltip message', async () => {
        const user = userEvent.setup()
        const { props } = renderComponent({
            currentStatus: 'open',
            disabled: true,
        })

        const button = screen.getByRole('button', { name: /close/i })

        expect(button).toBeDisabled()

        await act(async () => {
            await user.hover(button)
        })

        expect(
            await screen.findByText('Not available in standalone mode'),
        ).toBeInTheDocument()

        await act(async () => {
            await user.unhover(button)
        })
        expect(props.setQuickStatus).not.toHaveBeenCalled()
    })
})
