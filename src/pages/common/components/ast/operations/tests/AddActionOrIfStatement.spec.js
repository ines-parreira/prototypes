import React from 'react'
import {shallow} from 'enzyme'

import {AddActionOrIfStatement} from '../AddActionOrIfStatement'

describe('AddActionOrIfStatement component', () => {
    const commonProps = {
        rule: {},
        actions: {},
        parent: [],
        depth: 1,
        title: 'IF',
    }

    it('should render', () => {
        const component = shallow(
            <AddActionOrIfStatement
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a button to delete the block when it is allowed to delete itself', () => {
        const component = shallow(
            <AddActionOrIfStatement
                {...commonProps}
                removable
            />
        )

        expect(component).toMatchSnapshot()
    })
})
