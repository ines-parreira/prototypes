import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ClearSearchButton } from './ClearSearchButton'

describe('ClearSearchButton', () => {
    it('should render button with correct text', () => {
        render(<ClearSearchButton onClick={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /clear search/i }),
        ).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const onClick = jest.fn()
        render(<ClearSearchButton onClick={onClick} />)

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: /clear search/i }),
            )
        })

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
