import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NotificationsItem from 'common/navigation/components/NotificationsItem'
import { useNotificationsOverlay } from 'common/notifications'
import { assumeMock } from 'utils/testing'

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
