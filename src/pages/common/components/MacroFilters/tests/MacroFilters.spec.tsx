import React from 'react'
import {screen, render, waitFor, fireEvent} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState} from 'state/types'
import MacroFilters from '../MacroFilters'

const mockStore = configureMockStore([thunk])

describe('<MacroFilters />', () => {
    const defaultStore: Partial<RootState> = {
        macros: fromJS({
            parameters_options: {
                languages: ['en', 'fr'],
                tags: ['tag1', 'tag2'],
            },
        }),
    }
    beforeEach(() => {
        jest.resetAllMocks
    })
    const minProps = {
        selectedProperties: {
            languages: ['fr'],
            tags: ['tag1', 'tag2'],
        },
        onChange: jest.fn(),
    }
    it('should render MacroFilters', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroFilters {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render correctly set filters after click language', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroFilters {...minProps} />
            </Provider>
        )
        await waitFor(() => {
            screen.getByText('English')
        })

        fireEvent.click(getByText('English'))
        expect(minProps.onChange).toHaveBeenCalledWith({
            languages: ['en', null],
            tags: ['tag1', 'tag2'],
        })
    })

    it('should render correctly set filters after click tags', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroFilters {...minProps} />
            </Provider>
        )
        await waitFor(() => {
            screen.getByText('English')
        })

        fireEvent.click(getByText('tag2'))
        expect(minProps.onChange).toHaveBeenCalledWith({
            languages: ['fr'],
            tags: ['tag1'],
        })
    })
})
