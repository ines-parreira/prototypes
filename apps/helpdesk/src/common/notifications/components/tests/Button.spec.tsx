import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from 'common/segment'

import useCount from '../../hooks/useCount'
import Button from '../Button'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
)

jest.mock('../../hooks/useCount', () => jest.fn())
const useCountMock = assumeMock(useCount)

jest.mock('../Feed', () => () => <div>Feed</div>)

describe('Button', () => {
    beforeEach(() => {
        useCountMock.mockReturnValue(0)
    })

    it('should display the notification button', () => {
        render(<Button />)
        expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('should display the notification count when more than 0', () => {
        useCountMock.mockReturnValue(12)
        render(<Button />)
        expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('should render the feed when the button is clicked', () => {
        render(<Button />)
        userEvent.click(screen.getByText('Notifications'))
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.Opened,
        })
        expect(screen.getByText('Feed')).toBeInTheDocument()
    })

    it('should close the dropdown when the dropdown toggles', () => {
        render(<Button />)
        userEvent.click(screen.getByText('Notifications'))
        userEvent.click(screen.getByTestId('floating-overlay'))
        expect(screen.queryByText('Feed')).not.toBeInTheDocument()
    })
})
