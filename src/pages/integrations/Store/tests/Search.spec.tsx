import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import history from 'pages/history'
import Search from '../Search'
import {SEARCH_URL_PARAM} from '../constants'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

jest.spyOn(history, 'replace')
jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<Search />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should reflect url search in the input at render', () => {
        const inputValue = 'random'
        renderWithRouter(
            <Provider store={store}>
                <Search />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=${inputValue}`,
            }
        )
        expect(screen.getByRole('textbox')).toHaveValue(inputValue)
    })

    it('should clear the input if search params are removed from the url', () => {
        const history = createMemoryHistory()
        renderWithRouter(
            <Provider store={store}>
                <Search />
            </Provider>,
            {
                history,
                route: `?${SEARCH_URL_PARAM}=we don't care`,
            }
        )
        history.push('?')
        expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('should call history.replace dynamically when typing, ignoring surrounding spaces and lowercasing the value', () => {
        renderWithRouter(
            <Provider store={store}>
                <Search />
            </Provider>
        )
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: ' some Random value '},
        })
        expect(history.replace).toHaveBeenNthCalledWith(
            1,
            `?${SEARCH_URL_PARAM}=some%20random%20value`
        )
    })

    it('should call history.replace dynamically when clearing the input', () => {
        renderWithRouter(
            <Provider store={store}>
                <Search />
            </Provider>,
            {
                route: `?${SEARCH_URL_PARAM}=we don't care`,
            }
        )
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: ''},
        })
        expect(history.replace).toHaveBeenNthCalledWith(1, `?`)
    })

    it('should display the clear icon accordingly', () => {
        renderWithRouter(
            <Provider store={store}>
                <Search />
            </Provider>
        )
        const clearIcon = screen.getByText('cancel')
        expect(clearIcon).toHaveClass('hidden')
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'whatever'},
        })
        expect(clearIcon).not.toHaveClass('hidden')
    })
})
