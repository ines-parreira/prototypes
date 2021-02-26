import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import ViewName from '../ViewName'

const defaultView = {
    name: 'foo bar',
}

describe('<ViewName/>', () => {
    describe('.render()', () => {
        it('should display view name', () => {
            const wrapper = shallow(<ViewName view={fromJS(defaultView)} />)
            expect(wrapper.render()).toMatchSnapshot()
        })

        it('should pass props to span', () => {
            const wrapper = shallow(
                // @ts-ignore
                <ViewName view={fromJS(defaultView)} style={{color: 'red'}} />
            )
            expect(wrapper.render()).toMatchSnapshot()
        })

        it('should display emoji', () => {
            const wrapper = shallow(
                <ViewName
                    view={fromJS({
                        ...defaultView,
                        decoration: {
                            emoji: 'X',
                        },
                    })}
                />
            )
            expect(wrapper.render()).toMatchSnapshot()
        })

        it('should not display emoji if decoration is a string', () => {
            const wrapper = shallow(
                <ViewName
                    view={fromJS({
                        ...defaultView,
                        decoration: 'foo',
                    })}
                />
            )
            expect(wrapper.render()).toMatchSnapshot()
        })
    })
})
