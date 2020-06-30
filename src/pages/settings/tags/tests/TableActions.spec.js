import React from 'react'
import {mount} from 'enzyme'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import TableActions from '../TableActions'

const defaultTags = fromJS([
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

const defaultMeta = fromJS({
    1: {
        selected: true,
    },
    2: {
        selected: true,
    },
})

const defaultProps = {
    meta: defaultMeta,
    tags: defaultTags,
    selectedNum: 2,
    onMerge: _noop,
    onBulkDelete: _noop,
}

describe('TableActions', () => {
    it('should show merge confirmation popup on merge button click', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        const component = mount(<TableActions {...defaultProps} />, {
            attachTo: div,
        })
        component.find('button#bulk-merge-button').simulate('click')
        expect(document.body.innerHTML).toContain(
            'You are about to merge 2 tags into <b>billing</b>'
        )
    })

    it('should show delete confirmation popup on delete button click', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)
        const component = mount(<TableActions {...defaultProps} />, {
            attachTo: div,
        })
        component.find('button#bulk-remove-button').simulate('click')
        expect(document.body.innerHTML).toContain(
            'Are you sure you want to delete these tags?'
        )
    })
})
