import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BackButton } from '../components/BackButton'
import { getPreviousUrl } from '../urlTracking'

vi.mock('../urlTracking', () => ({
    getPreviousUrl: vi.fn(),
}))

const mockedGetPreviousUrl = vi.mocked(getPreviousUrl)

describe('BackButton', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('links to the fallback url when there is no in-app page to return to', () => {
        mockedGetPreviousUrl.mockReturnValue(null)

        render(
            <BackButton
                aria-label="Back to users"
                fallbackUrl="/app/settings/users"
            />,
        )

        expect(
            screen.getByRole('link', { name: 'Back to users' }),
        ).toHaveAttribute('href', '/app/settings/users')
    })

    it('links to the previous in-app page, preserving its query string', () => {
        mockedGetPreviousUrl.mockReturnValue(
            `${window.location.origin}/app/settings/users?search=andrei`,
        )

        render(
            <BackButton
                aria-label="Back to users"
                fallbackUrl="/app/settings/users"
            />,
        )

        expect(
            screen.getByRole('link', { name: 'Back to users' }),
        ).toHaveAttribute('href', '/app/settings/users?search=andrei')
    })
})
