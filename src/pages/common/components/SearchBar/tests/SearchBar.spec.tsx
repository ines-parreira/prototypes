import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {SearchBar} from 'pages/common/components/SearchBar/SearchBar'

const handleClearSearch = jest.fn()
const handleSearchValue = jest.fn()
const placeholder = 'Select value'

const props = {
    handleClearSearch,
    handleSearchValue,
    placeholder,
}

describe('SearchBar', () => {
    it('should render SearchBar', () => {
        render(<SearchBar {...props} />, {})

        expect(screen.getByText('search')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
        expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('should change the input value', async () => {
        render(<SearchBar {...props} />, {})

        const value = 'new value'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)
        expect(inputElement).toHaveValue(value)
    })

    it('should call the setters on value change', async () => {
        render(<SearchBar {...props} />, {})

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        expect(handleSearchValue).toHaveBeenCalledTimes(value.length)
        expect(handleSearchValue).toHaveBeenLastCalledWith(value)
    })

    it('should clear all values on clear', () => {
        render(<SearchBar {...props} />, {})

        fireEvent.click(screen.getByText('close'))

        expect(screen.getByRole('textbox')).toHaveValue('')
        expect(handleClearSearch).toHaveBeenCalledWith()
    })
})
