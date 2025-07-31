import { userEvent } from '@repo/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import Search from '../Search'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

describe('<Search />', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('render search input', () => {
        const { getByPlaceholderText } = render(<Search />)
        expect(getByPlaceholderText(/Search/)).toBeInTheDocument()
    })

    it('update input value', async () => {
        const text = 'hello there'
        const { getByPlaceholderText } = render(<Search />)
        const input = getByPlaceholderText(/Search/)
        userEvent.type(input, text)
        expect(input).toHaveValue(text)
    })

    it('handle controlled value', () => {
        const text = 'hello there'
        const { rerender, getByPlaceholderText } = render(<Search />)
        const input = getByPlaceholderText(/Search/)

        expect(input).toHaveValue('')

        rerender(<Search value={text} />)

        expect(input).toHaveValue(text)
    })

    it('debounce search value change', async () => {
        const text = 'hello there'
        const onChange = jest.fn()

        const { getByPlaceholderText } = render(
            <Search searchDebounceTime={100} onChange={onChange} />,
        )
        const input = getByPlaceholderText(/Search/)
        userEvent.type(input, text)

        expect(onChange).not.toHaveBeenCalled()

        jest.advanceTimersByTime(100)

        expect(onChange).toHaveBeenCalledWith(text)
    })

    it('blur input when entering escape key (with fireEvent)', async () => {
        const onBlur = jest.fn()
        const { getByPlaceholderText } = render(<Search onBlur={onBlur} />)

        const input = getByPlaceholderText(/Search/)
        input.focus()

        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', keyCode: 27 })

        await waitFor(() => {
            expect(onBlur).toHaveBeenCalled()
        })
    })
})
