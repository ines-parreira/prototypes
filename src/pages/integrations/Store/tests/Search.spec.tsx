import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from 'utils/testing'
import history from 'pages/history'
import Search from '../Search'
import {SEARCH_URL_PARAM} from '../constants'

jest.spyOn(history, 'replace')
jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<Search />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should reflect url search in the input at render', () => {
        const inputValue = 'random'
        renderWithRouter(<Search />, {
            route: `?${SEARCH_URL_PARAM}=${inputValue}`,
        })
        expect(screen.getByRole('textbox')).toHaveValue(inputValue)
    })

    it('should clear the input if search params are removed from the url', () => {
        const history = createMemoryHistory()
        renderWithRouter(<Search />, {
            history,
            route: `?${SEARCH_URL_PARAM}=we don't care`,
        })
        history.push('?')
        expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('should call history.replace dynamically when typing, ignoring surrounding spaces and lowercasing the value', () => {
        renderWithRouter(<Search />)
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: ' some Random value '},
        })
        expect(history.replace).toHaveBeenNthCalledWith(
            1,
            `?${SEARCH_URL_PARAM}=some%20random%20value`
        )
    })

    it('should call history.replace dynamically when clearing the input', () => {
        renderWithRouter(<Search />, {
            route: `?${SEARCH_URL_PARAM}=we don't care`,
        })
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: ''},
        })
        expect(history.replace).toHaveBeenNthCalledWith(1, `?`)
    })

    it('should display the clear icon accordingly', () => {
        renderWithRouter(<Search />)
        const clearIcon = screen.getByText('cancel')
        expect(clearIcon).toHaveClass('hidden')
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'whatever'},
        })
        expect(clearIcon).not.toHaveClass('hidden')
    })
})
