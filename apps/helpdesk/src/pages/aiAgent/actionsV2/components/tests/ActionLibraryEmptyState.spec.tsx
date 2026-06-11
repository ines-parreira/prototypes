import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ActionLibraryEmptyState } from '../ActionLibraryEmptyState'

describe('ActionLibraryEmptyState', () => {
    it('renders the empty-state heading and description', () => {
        render(<ActionLibraryEmptyState onCreate={jest.fn()} />)

        expect(
            screen.getByRole('heading', {
                name: /power ai agent with actions/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/automate the tasks your ai agent and team run/i),
        ).toBeInTheDocument()
    })

    it('invokes onCreate when the Create action button is clicked', async () => {
        const user = userEvent.setup()
        const onCreate = jest.fn()
        render(<ActionLibraryEmptyState onCreate={onCreate} />)

        await user.click(screen.getByRole('button', { name: /create action/i }))

        expect(onCreate).toHaveBeenCalledTimes(1)
    })
})
