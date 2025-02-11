import {render, screen} from '@testing-library/react'
import React from 'react'

import useCount from 'common/notifications/hooks/useCount'
import {assumeMock} from 'utils/testing'

import {GlobalNavigationNotificationBadge} from '../GlobalNavigationNotificationBadge'

jest.mock('common/notifications/hooks/useCount', () => jest.fn())
const useCountMock = assumeMock(useCount)

jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag')

describe('Global Navigation NotificationBadge', () => {
    beforeEach(() => {
        useCountMock.mockReturnValue(0)
    })

    it('should return nothing if there are no notifications', () => {
        const {container} = render(<GlobalNavigationNotificationBadge />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should show the notification count', () => {
        useCountMock.mockReturnValue(19)
        render(<GlobalNavigationNotificationBadge />)
        expect(screen.getByText('19')).toBeInTheDocument()
    })

    it('should show 99+ if there are more than 99 notifications', () => {
        useCountMock.mockReturnValue(200)
        render(<GlobalNavigationNotificationBadge />)
        expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should set xs right offset for single digit numbers', () => {
        useCountMock.mockReturnValue(5)
        render(<GlobalNavigationNotificationBadge />)
        expect(screen.getByText('5')).toHaveAttribute('data-right-offset', 's')
    })

    it('should set sm right offset for double digit numbers', () => {
        useCountMock.mockReturnValue(15)
        render(<GlobalNavigationNotificationBadge />)
        expect(screen.getByText('15')).toHaveAttribute('data-right-offset', 'm')
    })

    it('should set md right offset for 99+ badge', () => {
        useCountMock.mockReturnValue(100)
        render(<GlobalNavigationNotificationBadge />)
        expect(screen.getByText('99+')).toHaveAttribute(
            'data-right-offset',
            'l'
        )
    })
})
