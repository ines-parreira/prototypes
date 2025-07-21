import { render, screen } from '@testing-library/react'

import socketManager from 'services/socketManager'
import { SocketEventType } from 'services/socketManager/types'

import ActiveWrapUpCallBar from '../ActiveWrapUpCallBar'

jest.mock('services/socketManager')

describe('ActiveWrapUpCallBar', () => {
    const mockClearWrapUpTime = jest.fn()
    const callId = 123

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = () =>
        render(
            <ActiveWrapUpCallBar
                clearWrapUpTime={mockClearWrapUpTime}
                callId={callId}
            >
                <div data-testid="test-children">Test Content</div>
            </ActiveWrapUpCallBar>,
        )

    it('renders children correctly', () => {
        renderComponent()
        expect(screen.getByTestId('test-children')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('registers and unregisters socketManager events on mount and unmount', () => {
        const { unmount } = renderComponent()

        expect(socketManager.registerReceivedEvents).toHaveBeenCalledWith([
            expect.objectContaining({
                name: SocketEventType.VoiceCallWrapUpTimeEnded,
            }),
        ])

        unmount()

        expect(socketManager.unregisterReceivedEvents).toHaveBeenCalledWith([
            expect.objectContaining({
                name: SocketEventType.VoiceCallWrapUpTimeEnded,
            }),
        ])
    })

    it('clears wrap up time when matching event is received', () => {
        renderComponent()

        const eventRegistration =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]

        expect(eventRegistration.name).toBe(
            SocketEventType.VoiceCallWrapUpTimeEnded,
        )

        eventRegistration.onReceive({
            event: {
                voice_call_id: callId,
            },
        })

        expect(mockClearWrapUpTime).toHaveBeenCalled()
    })

    it('does not clear wrap up time when event with non-matching callId is received', () => {
        renderComponent()

        const eventRegistration =
            // @ts-ignore
            socketManager.registerReceivedEvents.mock.calls[0][0][0]

        eventRegistration.onReceive({
            event: {
                voice_call_id: 456,
            },
        })

        expect(mockClearWrapUpTime).not.toHaveBeenCalled()
    })
})
