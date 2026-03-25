import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatPreviewErrorState } from './ChatPreviewErrorState'

describe('ChatPreviewErrorState', () => {
    it('renders the error message', () => {
        render(<ChatPreviewErrorState />)

        expect(screen.getByText("Couldn't load preview.")).toBeInTheDocument()
    })

    it('does not render the reload button when onReload is not provided', () => {
        render(<ChatPreviewErrorState />)

        expect(
            screen.queryByRole('button', { name: /reload preview/i }),
        ).not.toBeInTheDocument()
    })

    it('renders and calls the reload button when onReload is provided', async () => {
        const user = userEvent.setup()
        const onReload = jest.fn()
        render(<ChatPreviewErrorState onReload={onReload} />)

        const button = screen.getByRole('button', { name: /reload preview/i })
        expect(button).toBeInTheDocument()

        await user.click(button)
        expect(onReload).toHaveBeenCalledTimes(1)
    })
})
