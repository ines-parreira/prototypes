import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import _noop from 'lodash/noop'
import {fromJS, List, Map} from 'immutable'

import TableActions from '../TableActions/TableActions'

const defaultTags: List<any> = fromJS([
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
])

const defaultMeta: Map<any, any> = fromJS({
    1: {
        selected: true,
    },
    2: {
        selected: true,
    },
})

const defaultProps: ComponentProps<typeof TableActions> = {
    meta: defaultMeta,
    tags: defaultTags,
    selectedNum: 2,
    onMerge: _noop,
    onBulkDelete: _noop,
}

describe('TableActions', () => {
    it('should show merge confirmation popup on merge button click', () => {
        render(<TableActions {...defaultProps} />)

        const button = document.querySelector('button#bulk-merge-button')
        if (button) {
            userEvent.click(button)
        }

        expect(document.body.innerHTML).toContain(
            'You are about to merge 2 tags into <b>billing</b>'
        )
    })

    it('should show delete confirmation popup on delete button click', () => {
        render(<TableActions {...defaultProps} />)

        const button = document.querySelector('button#bulk-remove-button')
        if (button) {
            userEvent.click(button)
        }

        expect(document.body.innerHTML).toContain(
            'Are you sure you want to delete these tags?'
        )
    })
})
