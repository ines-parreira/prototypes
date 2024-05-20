import React from 'react'
import {render, screen} from '@testing-library/react'

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
        getAvatarMock.mockReturnValue(Promise.resolve(gravatarUrl))
    })

    it('should render default with no props', () => {
        const {container} = render(<Avatar />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render only the initials', () => {
        getInitialsMock.mockReturnValue('MC')
        render(<Avatar name="Marie Curie" />)
        expect(screen.getByText('MC')).toMatchSnapshot()
    })

    it('should have custom url avatar', () => {
        render(<Avatar url="/marie/curie" />)
        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            '/marie/curie'
        )
    })

    it('should return Avatar for AI agent', () => {
        render(<Avatar isAIAgent size={32} />)
        expect(screen.getByText('auto_awesome')).toBeInTheDocument()
    })

    it('should render avatar from cache', () => {
        getAvatarFromCacheMock.mockReturnValue(gravatarUrl)
        render(<Avatar email="alex@gorgias.io" />)
        expect(screen.getByAltText('avatar').getAttribute('src')).toBe(
            gravatarUrl
        )
    })
})
