import React from 'react'
import {shallow, mount} from 'enzyme'

import {getAvatar} from '../utils.ts'
import Avatar from '../Avatar.tsx'
import {mockImageOnload} from '../../../../../tests/utils'

describe('Avatar component', () => {
    mockImageOnload()

    it('should render default with no props', () => {
        const component = shallow(<Avatar />)
        expect(component).toMatchSnapshot()
    })

    it('should render with className', () => {
        const component = shallow(<Avatar className="marie-curie" />)
        expect(component).toMatchSnapshot()
    })

    it('should render only the initials', () => {
        const component = shallow(<Avatar name="Marie Curie" />)
        expect(component).toMatchSnapshot()
    })

    it('should have custom url avatar', () => {
        const component = mount(<Avatar url="/marie/curie" />)
        expect(component.find('img')).toHaveProp('src', '/marie/curie')
    })

    it('should render avatar from cache', () => {
        return getAvatar({email: 'alex@gorgias.io'}).then(() => {
            const component = shallow(<Avatar email="alex@gorgias.io" />)
            return expect(component).toMatchSnapshot()
        })
    })

    it('should render image in visible container', async (done) => {
        // preload the image so the component can fetch it from the cache
        await getAvatar({email: 'alex@gorgias.io'})
        const component = mount(<Avatar email="alex@gorgias.io" />)
        // wait for the DOM to be up-to-date
        setTimeout(() => {
            expect(component).toMatchSnapshot()
            done()
        })
    })

    it('should not render image in invisible container', async (done) => {
        // preload the image so the component can fetch it from the cache
        await getAvatar({email: 'alex@gorgias.io'})
        const container = document.createElement('div')
        document.body.appendChild(container)
        container.style.display = 'none'
        const component = mount(<Avatar email="pepperoni@gorgias.io" />, {
            attachTo: container,
        })
        setTimeout(() => {
            expect(component).toMatchSnapshot()
            done()
        })
    })
})
