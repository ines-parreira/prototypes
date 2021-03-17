import React from 'react'
import {shallow} from 'enzyme/build'
import {fromJS} from 'immutable'

import {TableContainer} from '../Table'

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
        sort: () => {},
    }

    it('should display the same number of rows as there are tags', () => {
        const component = shallow(
            <TableContainer
                {...minProps}
                reverse={() => {}}
                onSort={() => {}}
                onSelectAll={() => {}}
                refresh={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
