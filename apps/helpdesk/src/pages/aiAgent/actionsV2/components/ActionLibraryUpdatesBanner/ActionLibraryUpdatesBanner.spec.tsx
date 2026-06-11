import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ActionLibraryUpdatesBanner } from './ActionLibraryUpdatesBanner'

const SHOP_NAME = 'test-shop'
const DISMISSED_KEY = `action-library-updates-banner-dismissed-${SHOP_NAME}`

describe('ActionLibraryUpdatesBanner', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders the banner heading and New tag', () => {
        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('heading', {
                name: /updates to how actions work/i,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders the App Store link and Learn more action', () => {
        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('link', { name: /app store/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /learn more/i }),
        ).toBeInTheDocument()
    })

    it('hides the banner after clicking the dismiss button', async () => {
        const user = userEvent.setup()
        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        await user.click(
            screen.getByRole('button', { name: /dismiss banner/i }),
        )

        expect(
            screen.queryByRole('heading', {
                name: /updates to how actions work/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('persists dismissal in localStorage', async () => {
        const user = userEvent.setup()
        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        await user.click(
            screen.getByRole('button', { name: /dismiss banner/i }),
        )

        expect(localStorage.getItem(DISMISSED_KEY)).toBe('true')
    })

    it('does not render when already dismissed', () => {
        localStorage.setItem(DISMISSED_KEY, 'true')

        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        expect(
            screen.queryByRole('heading', {
                name: /updates to how actions work/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('scopes dismissal to the shopName', () => {
        localStorage.setItem(
            'action-library-updates-banner-dismissed-other-shop',
            'true',
        )

        render(<ActionLibraryUpdatesBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('heading', {
                name: /updates to how actions work/i,
            }),
        ).toBeInTheDocument()
    })
})
