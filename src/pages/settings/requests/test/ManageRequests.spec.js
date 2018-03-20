import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {ManageRequests} from '../ManageRequests'

describe('ManageRequests component', () => {
    let container

    beforeEach(() => {
        // reactstrap popover needs to be in the dom
        // https://github.com/reactstrap/reactstrap/issues/818
        container = document.createElement('div')
        document.body.appendChild(container)
    })

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
            />,
            {attachTo: container}
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
            />,
            {attachTo: container}
        )
        component.setState({isFetching: false})
        expect(component).toMatchSnapshot()
    })
})
