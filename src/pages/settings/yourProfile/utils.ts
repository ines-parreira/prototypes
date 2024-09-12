import moment from 'moment'

/**
 * Check if the current user session is "recent" (logged in less than 10 minutes ago).
 *
 * Non-recent user sessions should not be able to access 2FA and password settings in case they
 * have been high-jacked in the meantime.
 *
 * @returns {boolean} Whether the current user performed a full login less than 10 minutes ago.
 */
export function isRecentLogin(): boolean {
    return (
        window.AUTH_TIME !== null &&
        moment(window.AUTH_TIME * 1000) >= moment().subtract(10, 'minutes')
    )
}
