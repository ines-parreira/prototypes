import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import * as logout from '../logoutUser'
import SessionChangeDetection, {
    LOGOUT_EXPLANATION,
    USER_CHANGE_EXPLANATION,
} from '../SessionChangeDetection'

describe('<SessionChangeDetection />', () => {
    describe('Logout event', () => {
        it('renders a pop-up once it receives the expected message', async () => {
            const logoutSpy = jest.spyOn(logout, 'logoutUser')

            render(<SessionChangeDetection />)

            expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull()

            window.postMessage(
                'check_session_iframe.user_logged_out',
                window.location.origin,
            )

            await waitFor(() => {
                expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeTruthy()
                expect(logoutSpy).toHaveBeenCalled()
            })
        })

        it('it does not render a pop-up for random messages', async () => {
            render(<SessionChangeDetection />)

            expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull()

            window.postMessage('whatever', window.location.origin)

            await waitFor(() =>
                expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull(),
            )
        })

        it('actually logs out the user', () => {
            jest.useFakeTimers()

            const seconds = 1

            logout.logoutUser(seconds)

            jest.advanceTimersByTime((seconds + 1) * 1000)

            expect(window.location.href).toContain('/logout')

            jest.useRealTimers()
        })
    })

    describe('User change event', () => {
        let location: Location
        beforeEach(() => {
            location = window.location
            ;(window as unknown as { location: Location }).location = {
                ...location,
                reload: jest.fn(),
            }
        })
        afterEach(() => {
            ;(window as unknown as { location: Location }).location = location
            jest.useRealTimers()
        })

        it('renders a pop-up once it receives the expected message and reloads after a while', () => {
            jest.useFakeTimers()

            render(<SessionChangeDetection />)
            expect(screen.queryByText(USER_CHANGE_EXPLANATION)).toBeNull()

            // Trigger a "user changed" event (we can't use postMessage with fake timers)
            act(() => {
                const event = new MessageEvent('message', {
                    data: 'check_session_iframe.user_changed',
                })
                dispatchEvent(event)
            })

            // The pop-up should be shown
            expect(screen.queryByText(USER_CHANGE_EXPLANATION)).toBeTruthy()

            // The page should reload after a delay
            expect(window.location.reload).not.toHaveBeenCalled()
            jest.advanceTimersByTime(10_000)
            expect(window.location.reload).toHaveBeenCalledTimes(1)
        })
    })
})
