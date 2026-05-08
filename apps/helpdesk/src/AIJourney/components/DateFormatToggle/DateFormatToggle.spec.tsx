import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DateFormatToggle } from './DateFormatToggle'

describe('DateFormatToggle', () => {
    it('shows "Absolute" label when format is absolute', () => {
        render(<DateFormatToggle format="absolute" onToggle={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /Absolute/i }),
        ).toBeInTheDocument()
    })

    it('shows "Relative" label when format is relative', () => {
        render(<DateFormatToggle format="relative" onToggle={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /Relative/i }),
        ).toBeInTheDocument()
    })

    it('calls onToggle when the button is clicked', async () => {
        const onToggle = jest.fn()
        const user = userEvent.setup()

        render(<DateFormatToggle format="absolute" onToggle={onToggle} />)

        await user.click(screen.getByRole('button', { name: /Absolute/i }))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })
})
