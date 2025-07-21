import React from 'react'

import { render, screen } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import { SearchInput } from '../SearchInput'

jest.mock('lodash/debounce', () => (fn: { cancel: () => void }) => {
    fn.cancel = jest.fn()
    return fn
})
const setSearch = jest.fn()

describe('SearchInput', () => {
    it('should render with a search icon and a clear icon when has a search value', () => {
        const { rerender } = render(<SearchInput setSearch={setSearch} />)
        expect(screen.queryByText('close')).toBeFalsy()
        rerender(<SearchInput search="foo" setSearch={setSearch} />)
        expect(screen.getByText('close'))
    })

    it('should call setSearch with empty string when clear icon is clicked', () => {
        render(<SearchInput search="foo" setSearch={setSearch} />)
        userEvent.click(screen.getByText('close'))
        expect(setSearch).toHaveBeenCalledWith('')
    })

    it('should call setSearch with empty string when input is cleared', () => {
        render(<SearchInput search="foo" setSearch={setSearch} />)
        userEvent.clear(screen.getByRole('textbox'))
        expect(setSearch).toHaveBeenCalledWith('')
    })

    it('should call setSearch with input value when input is changed', async () => {
        render(<SearchInput setSearch={setSearch} />)
        await userEvent.type(screen.getByRole('textbox'), 'foo')
        expect(setSearch).toHaveBeenCalledWith('foo')
    })

    it("should update input value when search prop changes and it's different from input value", async () => {
        const { rerender } = render(<SearchInput setSearch={setSearch} />)
        await userEvent.type(screen.getByRole('textbox'), 'foo')
        expect(screen.getByRole('textbox')).toHaveValue('foo')
        rerender(<SearchInput search="bar" setSearch={setSearch} />)
        expect(screen.getByRole('textbox')).toHaveValue('bar')
    })
})
