import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useCount from 'common/notifications/hooks/useCount'

import { NavigationSidebarNotificationsButton } from '../NavigationSidebarNotificationsButton'

jest.mock('common/notifications/hooks/useCount', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const useCountMock = assumeMock(useCount)

describe('NavigationSidebarNotificationsButton', () => {
    beforeEach(() => {
        useCountMock.mockReturnValue(0)
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
        useCountMock.mockReturnValue(0)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should render badge when count is greater than 0', () => {
        useCountMock.mockReturnValue(5)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render 99+ badge when count is greater than 99', () => {
        useCountMock.mockReturnValue(150)
        render(
            <MockSidebarProvider>
                <NavigationSidebarNotificationsButton />
            </MockSidebarProvider>,
        )

        expect(screen.getByText('99+')).toBeInTheDocument()
    })
})
