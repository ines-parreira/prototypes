import React from 'react'

import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketPriority } from '@gorgias/helpdesk-types'

import TicketPriorityDropdown from '../TicketPriorityDropdown'

describe('TicketPriorityDropdown', () => {
    it('should open the dropdown and update the selected priority', async () => {
        const user = userEvent.setup({ skipHover: true })
        const onPriorityChange = jest.fn()

        render(
            <TicketPriorityDropdown
                priority={TicketPriority.Critical}
                onPriorityChange={onPriorityChange}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /critical/i }))
        })

        expect(screen.getByText('Low')).toBeInTheDocument()

        await act(async () => {
            await user.click(screen.getByText('Low'))
        })

        expect(onPriorityChange).toHaveBeenCalledWith(TicketPriority.Low)
    })

    it('should show the standalone tooltip message when disabled', async () => {
        const user = userEvent.setup()

        render(
            <TicketPriorityDropdown
                priority={TicketPriority.Normal}
                onPriorityChange={jest.fn()}
                disabled
            />,
        )

        const button = screen.getByRole('button', { name: /normal/i })

        expect(button).toBeDisabled()

        await act(async () => {
            await user.hover(button)
        })

        expect(
            await screen.findByText('Not available in standalone mode'),
        ).toBeInTheDocument()
    })
})
