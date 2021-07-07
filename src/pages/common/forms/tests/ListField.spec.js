import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ListField from '../ListField.tsx'

describe('ListField component', () => {
    it('should render with no items and an "add" button', () => {
        const component = shallow(
            <ListField onChange={() => {}} items={fromJS([])} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with some items and an "add" button', () => {
        const component = shallow(
            <ListField onChange={() => {}} items={fromJS(['foo', 'bar'])} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render with the max number of items and no "add" button', () => {
        const component = shallow(
            <ListField
                onChange={() => {}}
                items={fromJS(['foo', 'bar'])}
                maxItems={2}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
