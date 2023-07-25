import React from 'react'
import {shallow, mount} from 'enzyme'

import {assumeMock} from 'utils/testing'
import {getAvatarFromCache, getAvatar, getInitials} from '../utils'

import Avatar from '../Avatar'

jest.mock('../utils')
const getAvatarMock = assumeMock(getAvatar)
const getAvatarFromCacheMock = assumeMock(getAvatarFromCache)
const getInitialsMock = assumeMock(getInitials)

const gravatarUrl =
    'https://www.gravatar.com/avatar/b0603c6a6734698e0b93b1350c6c8286?d=404&s=50'

describe('Avatar component', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render default with no props', () => {
        const component = shallow(<Avatar />)
        expect(component).toMatchSnapshot()
    })

    it('should render with className', () => {
        const component = shallow(<Avatar className="marie-curie" />)
        expect(component).toMatchSnapshot()
    })

    it('should render only the initials', () => {
        getInitialsMock.mockReturnValue('MC')
        const component = shallow(<Avatar name="Marie Curie" />)
        expect(component).toMatchSnapshot()
    })

    it('should have custom url avatar', () => {
        const component = mount(<Avatar url="/marie/curie" />)
        expect(component.find('img')).toHaveProp('src', '/marie/curie')
    })

    it('should render avatar from cache', () => {
        getAvatarFromCacheMock.mockReturnValue(gravatarUrl)
        const component = shallow(<Avatar email="alex@gorgias.io" />)
        return expect(component).toMatchSnapshot()
    })

    it('should render image in visible container', () => {
        // preload the image so the component can fetch it from the cache
        getAvatarMock.mockResolvedValue(gravatarUrl)
        const component = mount(<Avatar email="alex@gorgias.io" />)
        component.setState({imageUrl: gravatarUrl})
        expect(component).toMatchSnapshot()
    })

    it('should not render image in invisible container', () => {
        // preload the image so the component can fetch it from t he cache
        getAvatarMock.mockResolvedValue(gravatarUrl)
        const container = document.createElement('div')
        document.body.appendChild(container)
        container.style.display = 'none'
        const component = mount(<Avatar email="pepperoni@gorgias.io" />, {
            attachTo: container,
        })
        expect(component).toMatchSnapshot()
    })
    it('should render image with round shape', () => {
        const component = mount(<Avatar url="/marie/curie" shape="round" />)
        expect(component).toMatchSnapshot()
    })
})
