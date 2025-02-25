import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import {
    getCurrentUser,
    isAvailable as getIsAvailable,
} from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

import UserMenuWithToggle from '../UserMenuWithToggle'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
    isAvailable: jest.fn(),
}))
const getCurrentUserMock = assumeMock(getCurrentUser)
const getIsAvailableMock = assumeMock(getIsAvailable)

jest.mock('../UserMenu', () => () => <div>UserMenu</div>)

describe('UserMenuWithToggle', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(fromJS({ name: 'John Doe' }))
        getIsAvailableMock.mockReturnValue(true)
    })

    it('should render the toggle with the user name', () => {
        const { getByText } = render(<UserMenuWithToggle />)
        expect(getByText('John Doe')).toBeInTheDocument()
    })

    it('should fall back to the user email if the name is not given', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ email: 'john.doe@example.com' }),
        )
        const { getByText } = render(<UserMenuWithToggle />)
        expect(getByText('john.doe@example.com')).toBeInTheDocument()
    })

    it('should render the badge as available', () => {
        const { container } = render(<UserMenuWithToggle />)
        const badge = container.querySelector('.badge')
        expect(badge).toHaveStyle('background-color: rgb(36, 214, 157)')
    })

    it('should render the badge as unavailable', () => {
        getIsAvailableMock.mockReturnValue(false)
        const { container } = render(<UserMenuWithToggle />)
        const badge = container.querySelector('.badge')
        expect(badge).toHaveStyle('background-color: rgb(255, 150, 0)')
    })

    it('should show the user menu when the user button is clicked', () => {
        const { getByText } = render(<UserMenuWithToggle />)
        userEvent.click(getByText('John Doe'))
        expect(getByText('UserMenu')).toBeInTheDocument()
    })
})
