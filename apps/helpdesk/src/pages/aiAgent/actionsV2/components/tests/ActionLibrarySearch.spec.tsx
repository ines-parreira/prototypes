import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ActionLibrarySearch } from '../ActionLibrarySearch'

describe('ActionLibrarySearch', () => {
    it('renders the search input with the current value', () => {
        render(
            <ActionLibrarySearch
                value="hello"
                onChange={jest.fn()}
                totalCount={5}
                filteredCount={5}
            />,
        )

        expect(
            screen.getByRole('textbox', { name: /search actions/i }),
        ).toHaveValue('hello')
    })

    it('shows the filtered count vs total', () => {
        render(
            <ActionLibrarySearch
                value=""
                onChange={jest.fn()}
                totalCount={10}
                filteredCount={3}
            />,
        )

        expect(screen.getByText('Showing 3 of 10 items')).toBeInTheDocument()
    })

    it('calls onChange when the user types', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <ActionLibrarySearch
                value=""
                onChange={onChange}
                totalCount={0}
                filteredCount={0}
            />,
        )

        await user.type(
            screen.getByRole('textbox', { name: /search actions/i }),
            'q',
        )

        expect(onChange).toHaveBeenCalledWith('q')
    })
})
