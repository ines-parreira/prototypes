import React from 'react'
import {shallow} from 'enzyme/build'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Table from '../Table'

const mockStore = configureMockStore([thunk])

describe('ManageTags Table component', () => {
    let store

    beforeEach(() => {
        store = mockStore({
            tags: fromJS({
                items: [
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
                ],
                meta: {
                    1: {
                        selected: true,
                    },
                    2: {
                        selected: true,
                    },
                },
                _internal: {
                    pagination: {
                        per_page: 30,
                        page: 1,
                        nb_pages: 1,
                        item_count: 3,
                        current_page: '/api/views/?page=1',
                    },
                },
            }),
        })
    })

    it('should display the same number of rows as there are tags', () => {
        const component = shallow(
            <Table
                store={store}
                sort={() => {}}
                reverse={() => {}}
                onSort={() => {}}
                onSelectAll={() => {}}
                refresh={() => {}}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
