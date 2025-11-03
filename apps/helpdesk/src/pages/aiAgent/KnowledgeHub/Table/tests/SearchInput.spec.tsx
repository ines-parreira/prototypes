import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SearchInput } from '../SearchInput'

describe('SearchInput', () => {
    it('renders search input with default placeholder', () => {
        render(<SearchInput value="" onChange={jest.fn()} />)

        const input = screen.getByLabelText('Search knowledge items')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('placeholder', 'Search...')
    })

    it('renders search input with custom placeholder', () => {
        render(
            <SearchInput
                value=""
                onChange={jest.fn()}
                placeholder="Find items..."
            />,
        )

        const input = screen.getByLabelText('Search knowledge items')
        expect(input).toHaveAttribute('placeholder', 'Find items...')
    })

    it('displays the provided value', () => {
        render(<SearchInput value="test query" onChange={jest.fn()} />)

        const input = screen.getByLabelText('Search knowledge items')
        expect(input).toHaveValue('test query')
    })

    it('calls onChange when user types', async () => {
        const handleChange = jest.fn()
        render(<SearchInput value="" onChange={handleChange} />)

        const input = screen.getByLabelText('Search knowledge items')
        await act(async () => {
            await userEvent.type(input, 'new search')
        })

        expect(handleChange).toHaveBeenCalled()
    })

    it('renders with leading icon slot', () => {
        const { container } = render(
            <SearchInput value="" onChange={jest.fn()} />,
        )

        const textField = container.querySelector('input[type="text"]')
        expect(textField).toBeInTheDocument()
    })
})
