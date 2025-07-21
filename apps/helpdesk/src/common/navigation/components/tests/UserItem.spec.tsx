import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    getCurrentUser,
    isAvailable as getIsAvailable,
} from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import UserItem from '../UserItem'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
    isAvailable: jest.fn(),
}))
const getCurrentUserMock = assumeMock(getCurrentUser)
const getIsAvailableMock = assumeMock(getIsAvailable)

jest.mock('../UserMenu', () => () => <div>UserMenu</div>)

describe('UserItem', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(fromJS({ name: 'John Doe' }))
        getIsAvailableMock.mockReturnValue(true)
    })

    it('should render the user avatar', () => {
        render(<UserItem />)
        expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should fall back to the user email if the name is not given', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ email: 'john.doe@example.com' }),
        )
        render(<UserItem />)
        expect(screen.getByText('j')).toBeInTheDocument()
    })

    it('should render the badge as available', () => {
        const { container } = render(<UserItem />)
        const badge = container.querySelector('.badge')
        expect(badge).toHaveStyle('background-color: var(--feedback-success)')
    })

    it('should render the badge as unavailable', () => {
        getIsAvailableMock.mockReturnValue(false)
        const { container } = render(<UserItem />)
        const badge = container.querySelector('.badge')
        expect(badge).toHaveStyle('background-color: var(--feedback-warning)')
    })

    it('should show the user menu on click', () => {
        render(<UserItem />)
        userEvent.click(screen.getByText('JD'))
        expect(screen.getByText('UserMenu')).toBeInTheDocument()
    })
})
