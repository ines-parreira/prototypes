import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {ManageRequests} from '../ManageRequests'

describe('ManageRequests component', () => {
    it('should display loader', () => {
        const component = mount(
            <ManageRequests
                fetchRequests={() => Promise.resolve()}
                requests={fromJS({})}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should load with empty props', () => {
        const component = mount(
            <ManageRequests
                fetchRequests={() => Promise.resolve()}
                requests={fromJS({})}
            />
        )
        component.setState({isFetching: false})
        expect(component).toMatchSnapshot()
    })

    it('should display requests', () => {
        const component = mount(
            <ManageRequests
                fetchRequests={() => Promise.resolve()}
                requests={fromJS([
                    {
                        id: 123,
                        name: 'missing items',
                    },
                    {
                        id: 125,
                        name: 'order status',
                    },
                ])}
            />
        )
        component.setState({isFetching: false})
        expect(component).toMatchSnapshot()
    })
})
