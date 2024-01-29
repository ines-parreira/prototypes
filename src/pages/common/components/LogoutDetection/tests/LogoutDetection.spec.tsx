import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import LogoutDetection, {LOGOUT_EXPLANATION} from '../LogoutDetection'
import * as logout from '../logoutUser'

describe('<LogoutDetection />', () => {
    it('renders a pop-up once it receives the expected message', async () => {
        const logoutSpy = jest.spyOn(logout, 'logoutUser')

        render(<LogoutDetection />)

        expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull()

        window.postMessage(
            'check_session_iframe.user_logged_out',
            window.location.origin
        )

        await waitFor(() => {
            expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeTruthy()
            expect(logoutSpy).toHaveBeenCalled()
        })
    })

    it('it does not render a pop-up for random messages', async () => {
        render(<LogoutDetection />)

        expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull()

        window.postMessage('whatever', window.location.origin)

        await waitFor(() =>
            expect(screen.queryByText(LOGOUT_EXPLANATION)).toBeNull()
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
