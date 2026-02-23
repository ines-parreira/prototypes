import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useNotificationsOverlay } from 'common/notifications'
import useCount from 'common/notifications/hooks/useCount'

import { NavigationSidebarNotificationsButton } from '../NavigationSidebarNotificationsButton'

jest.mock('common/notifications', () => ({
    useNotificationsOverlay: jest.fn(),
}))

jest.mock('common/notifications/hooks/useCount', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const useNotificationsOverlayMock = assumeMock(useNotificationsOverlay)
const useCountMock = assumeMock(useCount)

describe('NavigationSidebarNotificationsButton', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        onToggle = jest.fn()
        useNotificationsOverlayMock.mockReturnValue([false, onToggle])
        useCountMock.mockReturnValue(0)
    })

    it('should render the notifications button', () => {
        render(<NavigationSidebarNotificationsButton />)
        expect(
            screen.getByRole('button', { name: /notifications/i }),
        ).toBeInTheDocument()
    })

    it('should not render badge when count is 0', () => {
        useCountMock.mockReturnValue(0)
        render(<NavigationSidebarNotificationsButton />)

        expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should render badge when count is greater than 0', () => {
        useCountMock.mockReturnValue(5)
        render(<NavigationSidebarNotificationsButton />)

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render 99+ badge when count is greater than 99', () => {
        useCountMock.mockReturnValue(150)
        render(<NavigationSidebarNotificationsButton />)

        expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should toggle notifications overlay when clicked', async () => {
        const user = userEvent.setup()
        useCountMock.mockReturnValue(5)
        render(<NavigationSidebarNotificationsButton />)

        await user.click(screen.getByRole('button', { name: /notifications/i }))

        expect(onToggle).toHaveBeenCalledTimes(1)
    })
})
