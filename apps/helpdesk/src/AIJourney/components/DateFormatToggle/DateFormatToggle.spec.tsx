import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DateFormatToggle } from './DateFormatToggle'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: React.ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

describe('DateFormatToggle', () => {
    it('shows "Absolute" label and "Switch to relative" tooltip when format is absolute', () => {
        render(<DateFormatToggle format="absolute" onToggle={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /Absolute/i }),
        ).toBeInTheDocument()
        expect(screen.getByRole('tooltip')).toHaveTextContent(
            /Switch to relative timestamps/,
        )
    })

    it('shows "Relative" label and "Switch to absolute" tooltip when format is relative', () => {
        render(<DateFormatToggle format="relative" onToggle={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /Relative/i }),
        ).toBeInTheDocument()
        expect(screen.getByRole('tooltip')).toHaveTextContent(
            /Switch to absolute timestamps/,
        )
    })

    it('calls onToggle when the button is clicked', async () => {
        const onToggle = jest.fn()
        const user = userEvent.setup()

        render(<DateFormatToggle format="absolute" onToggle={onToggle} />)

        await user.click(screen.getByRole('button', { name: /Absolute/i }))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })
})
