import React from 'react'
import {shallow, mount} from 'enzyme'

import {getAvatar} from '../utils'
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

    it('should render avatar from cache', () => {
        return getAvatar({email: 'alex@gorgias.io'})
            .then(() => {
                const component = shallow(<Avatar email="alex@gorgias.io"/>)
                return expect(component).toMatchSnapshot()
            })
    })

    it('should render image in visible container', (done) => {
        const component = mount(
            <Avatar email="pizza@gorgias.io" />
        )
        // wait for image url to return
        global.jestSetTimeout(() => {
            component.update()
            expect(component.find('img').length).toBe(1)
        }, 10, done)
    })

    it('should not render image in invisible container', (done) => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        container.style.display = 'none'
        const component = mount(
            <Avatar email="pepperoni@gorgias.io" />,
            {attachTo: container}
        )
        global.jestSetTimeout(() => {
            expect(component.find('img').length).toBe(0)
        }, 10, done)
    })
})
