import { render, userEvent } from '@repo/testing'

import { LibrarySearchInput } from './LibrarySearchInput'

describe('LibrarySearchInput', () => {
    it('forwards value changes', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByRole } = render(
            <LibrarySearchInput value="" onChange={onChange} />,
        )

        await user.type(getByRole('searchbox', { name: 'Search actions' }), 'o')

        expect(onChange).toHaveBeenCalledWith('o')
    })

    it('clears the value when the clear control is activated', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByRole } = render(
            <LibrarySearchInput value="order" onChange={onChange} />,
        )

        await user.click(getByRole('button', { name: /clear/i }))

        expect(onChange).toHaveBeenCalledWith('')
    })

    it('uses the provided placeholder and aria-label', () => {
        const { getByRole, getByPlaceholderText } = render(
            <LibrarySearchInput
                value=""
                onChange={() => {}}
                placeholder="Find an action"
                ariaLabel="Search the library"
            />,
        )

        expect(
            getByRole('searchbox', { name: 'Search the library' }),
        ).toBeInTheDocument()
        expect(getByPlaceholderText('Find an action')).toBeInTheDocument()
    })

    it('falls back to default placeholder and aria-label', () => {
        const { getByRole, getByPlaceholderText } = render(
            <LibrarySearchInput value="" onChange={() => {}} />,
        )

        expect(
            getByRole('searchbox', { name: 'Search actions' }),
        ).toBeInTheDocument()
        expect(getByPlaceholderText('Search...')).toBeInTheDocument()
    })
})
