import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { useUnreadCount } from '@repo/notifications'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { NavigationSidebarNotificationsButton } from '../NavigationSidebarNotificationsButton'

jest.mock('@repo/notifications', () => ({
    useUnreadCount: jest.fn(),
}))

const useUnreadCountMock = assumeMock(useUnreadCount)

describe('NavigationSidebarNotificationsButton', () => {
    beforeEach(() => {
        useUnreadCountMock.mockReturnValue(0)
    })

    it('should render the notifications button', () => {
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )
        expect(
            screen.getByRole('button', { name: /notifications/i }),
        ).toBeInTheDocument()
    })

    it('should not render badge when count is 0', () => {
        useUnreadCountMock.mockReturnValue(0)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should render badge when count is greater than 0', () => {
        useUnreadCountMock.mockReturnValue(5)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render 99+ badge when count is greater than 99', () => {
        useUnreadCountMock.mockReturnValue(150)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.getByText('99+')).toBeInTheDocument()
    })
})
