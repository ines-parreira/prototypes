import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { NoShopifyProfile } from '../NoShopifyProfile'

describe('NoShopifyProfile', () => {
    it('renders the empty state message', () => {
        render(<NoShopifyProfile onSyncProfile={vi.fn()} />)

        expect(
            screen.getByText(
                /no matching profile found\. do you want to sync this customer to shopify\?/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders the sync profile button', () => {
        render(<NoShopifyProfile onSyncProfile={vi.fn()} />)

        expect(
            screen.getByRole('button', { name: /sync profile/i }),
        ).toBeInTheDocument()
    })

    it('calls onSyncProfile when clicking the button', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <NoShopifyProfile onSyncProfile={onSyncProfile} />,
        )

        await user.click(screen.getByRole('button', { name: /sync profile/i }))

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
    })
})
