import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import {ManageRequestItem} from '../ManageRequestItem'

describe('ManageRequestItem component', () => {
    it('should display empty', () => {
        const component = mount(
            <ManageRequestItem
                requests={fromJS([])}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should display a selected request', () => {
        const component = mount(
            <ManageRequestItem
                requests={fromJS([
                    {
                        id: 1,
                        name: 'a',
                    },
                    {
                        id: 2,
                        name: 'b',
                    },
                ])}
                requestId={2}
            />
        )
        expect(component.find('#id-name').props().value).toBe('b')
        expect(component).toMatchSnapshot()
    })
})
