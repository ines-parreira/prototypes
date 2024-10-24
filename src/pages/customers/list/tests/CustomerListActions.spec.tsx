import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import CustomerListActions from '../CustomerListActions'

const mockStore = configureMockStore([thunk])

describe('<CustomerListActions />', () => {
    const minProps = {
        selectedItemsIds: fromJS([1, 2]),
        view: fromJS({
            id: 8,
        }),
    }

    it('should open popover confirmation', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <CustomerListActions {...minProps} />
            </Provider>
        )
        fireEvent.click(getByText(/Actions/))
        fireEvent.click(getByText(/Delete customers/))

        expect(
            getByText(/Are you sure you want to delete 2 customers/)
        ).toBeInTheDocument()
    })

    it('should not display any view count if the data is missing', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    views: fromJS({active: {allItemsSelected: true}}),
                })}
            >
                <CustomerListActions {...minProps} />
            </Provider>
        )
        fireEvent.click(getByText(/Actions/))
        fireEvent.click(getByText(/Delete customers/))
        expect(
            getByText(/Are you sure you want to delete customer/)
        ).toBeInTheDocument()
    })
})
