import React from 'react'
import {shallow} from 'enzyme'

import ViewName from '../ViewName'

const defaultView = {
    name: 'foo bar',
}

describe('<ViewName/>', () => {
    describe('.render()', () => {
        it('should display view name', () => {
            const wrapper = shallow(<ViewName viewName={defaultView.name} />)
            expect(wrapper.render()).toMatchSnapshot()
        })

        it('should display emoji', () => {
            const wrapper = shallow(
                <ViewName viewName={defaultView.name} emoji="X" />
            )
            expect(wrapper.render()).toMatchSnapshot()
        })

        it('should not display emoji if decoration is not a string', () => {
            const wrapper = shallow(
                // @ts-ignore
                <ViewName viewName={defaultView.name} emoji={8} />
            )
            expect(wrapper.render()).toMatchSnapshot()
        })
    })
})
