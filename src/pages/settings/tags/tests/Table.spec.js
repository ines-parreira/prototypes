import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {TableContainer} from '../Table'

jest.mock('../Row', () => {
    return jest.requireActual('../Row').Row
})

describe('ManageTags Table component', () => {
    const minProps = {
        tags: fromJS([
            {
                id: 1,
                name: 'refund',
            },
            {
                id: 2,
                name: 'billing',
            },
            {
                id: 3,
                name: 'shipping',
            },
        ]),
        meta: fromJS({
            1: {
                selected: true,
            },
            2: {
                selected: true,
            },
        }),
        getSelectedTagMeta: () => fromJS({}),
        selectAll: false,
        sort: 'name',
        reverse: jest.fn(),
        onSort: jest.fn(),
        onSelectAll: jest.fn(),
        refresh: jest.fn(),
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the same number of rows as there are tags', () => {
        const {container} = render(<TableContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should order the table when clicking on the usage header cell', () => {
        const {getByText} = render(<TableContainer {...minProps} />)

        fireEvent.click(getByText(/Tickets/i))
        expect(minProps.onSort).toHaveBeenNthCalledWith(1, 'usage', false)
    })

    it('should not order the table when clicking on the description header cell', () => {
        const {getByText} = render(<TableContainer {...minProps} />)

        fireEvent.click(getByText(/Description/i))
        expect(minProps.onSort).not.toHaveBeenCalled()
    })
})
