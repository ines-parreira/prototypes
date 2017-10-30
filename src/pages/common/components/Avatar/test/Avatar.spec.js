import React from 'react'
import {shallow, mount} from 'enzyme'

import Avatar from '../Avatar'

describe('Avatar component', () => {
    it('should render default with no props', () => {
        const component = shallow(
            <Avatar />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render with className', () => {
        const component = shallow(
            <Avatar className="marie-curie" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render only the initials', () => {
        const component = shallow(
            <Avatar name="Marie Curie" />
        )
        expect(component).toMatchSnapshot()
    })

    it('should have custom url avatar', () => {
        const component = mount(
            <Avatar
                url="/marie/curie"
            />
        )
        expect(component.find('img')).toHaveProp('src', '/marie/curie')
    })
})
