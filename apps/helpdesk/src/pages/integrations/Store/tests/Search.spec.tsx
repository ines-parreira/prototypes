import React from 'react'

import { render } from '@repo/testing'
import { act, fireEvent, screen } from '@testing-library/react'
import { Link, useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { SEARCH_URL_PARAM } from '../constants'
import { Search } from '../Search'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const LocationSearch = () => {
    const location = useLocation()

    return <output aria-label="Current search">{location.search}</output>
}

const renderComponent = (initialEntries = ['/']) =>
    render(
        <>
            <Search />
            <Link to="?">Clear URL search</Link>
            <LocationSearch />
        </>,
        {
            initialEntries,
            storeState: store.getState() as object,
        },
    )

const advanceSearchDebounce = () => {
    act(() => {
        jest.advanceTimersByTime(200)
    })
}

describe('<Search />', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should reflect url search in the input at render', () => {
        const inputValue = 'random'
        renderComponent([`?${SEARCH_URL_PARAM}=${inputValue}`])
        expect(screen.getByRole('textbox')).toHaveValue(inputValue)
    })
    it('should clear the input if search params are removed from the url', () => {
        renderComponent([`?${SEARCH_URL_PARAM}=we don't care`])
        fireEvent.click(screen.getByRole('link', { name: 'Clear URL search' }))
        expect(screen.getByRole('textbox')).toHaveValue('')
    })
    it('should update the URL search dynamically when typing, ignoring surrounding spaces and lowercasing the value', () => {
        renderComponent()
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: ' some Random value ' },
        })
        advanceSearchDebounce()
        expect(
            screen.getByText(`?${SEARCH_URL_PARAM}=some%20random%20value`),
        ).toBeInTheDocument()
    })
    it('should update the URL search dynamically when clearing the input', () => {
        renderComponent([`?${SEARCH_URL_PARAM}=we don't care`])
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: '' },
        })
        advanceSearchDebounce()
        expect(screen.getByLabelText('Current search')).toHaveTextContent('')
    })

    it('should clear the URL search immediately when clicking the clear icon', () => {
        renderComponent([`?${SEARCH_URL_PARAM}=shopify`])
        fireEvent.click(screen.getByText('cancel'))
        expect(screen.getByLabelText('Current search')).toHaveTextContent('')
    })

    it('should display the clear icon accordingly', () => {
        renderComponent()
        const clearIcon = screen.getByText('cancel')
        expect(clearIcon).toHaveClass('hidden')
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'whatever' },
        })
        expect(clearIcon).not.toHaveClass('hidden')
    })
})
