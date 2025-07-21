import { fireEvent, render, screen } from '@testing-library/react'

import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'
import { userEvent } from 'utils/testing/userEvent'

const handleSearchValue = jest.fn()

describe('SearchBar', () => {
    it('should render SearchBar', () => {
        render(<SearchBar />)

        expect(screen.getByText('search')).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render default value', () => {
        render(<SearchBar defaultValue="hello" />)

        expect(screen.getByRole('textbox')).toHaveValue('hello')
    })

    it('should work as uncontrolled component', async () => {
        render(<SearchBar />)

        const value = 'new value'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        expect(inputElement).toHaveValue(value)
    })

    it('should work as controlled component', async () => {
        render(<SearchBar onChange={handleSearchValue} />)

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        expect(handleSearchValue).toHaveBeenCalled()
        expect(handleSearchValue).toHaveBeenLastCalledWith(value)
    })

    it('should show clear button when there is a value', () => {
        render(<SearchBar value="hello" />)
        expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('should clear all values on clear', async () => {
        render(<SearchBar onChange={handleSearchValue} />)

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        fireEvent.click(screen.getByText('close'))

        expect(screen.getByRole('textbox')).toHaveValue('')
        expect(handleSearchValue).toHaveBeenCalledWith('')
    })
})
