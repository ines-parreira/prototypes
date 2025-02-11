import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {useNotificationsOverlay} from 'common/notifications'
import {assumeMock} from 'utils/testing'

import NotificationsItem from '../NotificationsItem'

jest.mock('common/notifications', () => ({
    useNotificationsOverlay: jest.fn(),
}))

jest.mock('../GlobalNavigationNotificationBadge', () => ({
    GlobalNavigationNotificationBadge: () => (
        <div data-testid="notification-badge" />
    ),
}))

const useNotificationsOverlayMock = assumeMock(useNotificationsOverlay)

describe('NotificationsItem', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        onToggle = jest.fn()
        useNotificationsOverlayMock.mockReturnValue([false, onToggle])
    })

    it('should render the item', () => {
        render(<NotificationsItem />)
        expect(screen.getByText('notifications')).toBeInTheDocument()
    })

    it('should toggle the notifications overlay when clicked', () => {
        render(<NotificationsItem />)
        userEvent.click(screen.getByText('notifications'))
        expect(onToggle).toHaveBeenCalled()
    })
})
