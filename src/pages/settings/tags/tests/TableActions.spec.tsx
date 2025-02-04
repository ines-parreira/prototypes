import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {tags} from 'fixtures/tag'

import TableActions from '../TableActions/TableActions'

const mockStore = configureMockStore()

const defaultProps: ComponentProps<typeof TableActions> = {
    selectedTagsIds: fromJS([1, 2]),
    onMerge: jest.fn(),
    onBulkDelete: jest.fn(),
}

const defaultState = {
    tags: fromJS({
        items: tags,
    }),
}

describe('<TableActions />', () => {
    it('should show merge confirmation popup on merge button click', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TableActions {...defaultProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText('Merge'))
        expect(
            screen.getByText(/You are about to merge 1 tag/).textContent
        ).toBe(
            'You are about to merge 1 tag (refund) into billing.This action cannot be undone.'
        )
    })

    it('should show delete confirmation popup on delete button click', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TableActions {...defaultProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText('Delete'))
        expect(
            screen.getByText(/You are about to delete 2 tags/).textContent
        ).toBe(
            'You are about to delete 2 tags: refund and billing.They will be removed from all tickets.Historical Statistics for these tags will be lost.It will not be possible to add the tags back on the tickets they were on.The tags will have to be removed from Saved Filters manually.'
        )
    })
})
