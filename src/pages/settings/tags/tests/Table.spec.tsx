import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import {Map, fromJS} from 'immutable'

import {tags} from 'fixtures/tag'

import {Row} from '../Row'
import {TableContainer} from '../Table'

jest.mock('../Row', () => {
    const {Row: rowMock} = jest.requireActual('../Row')
    return rowMock as Row
})

describe('ManageTags Table component', () => {
    const minProps: Omit<ComponentProps<typeof TableContainer>, 'columns'> = {
        tags,
        meta: fromJS({
            1: {
                selected: true,
            },
            2: {
                selected: true,
            },
        }),
        getSelectedTagMeta: () => fromJS({}) as Map<any, any>,
        selectAll: false,
        sort: 'name',
        reverse: true,
        onSort: jest.fn(),
        onSelectAll: jest.fn(),
        refresh: jest.fn(),
        dispatch: jest.fn(),
        onBulkDelete: jest.fn(),
        onMerge: jest.fn(),
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
