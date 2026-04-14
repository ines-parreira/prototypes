import { render } from '@repo/testing/vitest'
import { screen, waitFor } from '@testing-library/react'

import type { Integration } from '@gorgias/helpdesk-types'

import { StorePicker } from './StorePicker'

const mockIntegrations: Integration[] = [
    {
        id: 1,
        name: 'Test Shopify Store',
        type: 'shopify',
        created_datetime: '2024-01-01T00:00:00Z',
        meta: { shop_name: 'test-store' },
    } as Integration,
    {
        id: 2,
        name: 'Second Shopify Store',
        type: 'shopify',
        created_datetime: '2024-01-02T00:00:00Z',
        meta: { shop_name: 'second-store' },
    } as Integration,
]

describe('StorePicker', () => {
    async function openStorePicker(user: ReturnType<typeof render>['user']) {
        await user.click(
            screen.getByRole('textbox', { name: /select a store/i }),
        )
    }

    it('renders selected integration', async () => {
        render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
            />,
        )

        expect(screen.getByRole('textbox')).toHaveValue('Test Shopify Store')
    })

    it('does not render sync action when onSyncProfile is not provided', async () => {
        const { user } = render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
            />,
        )

        await openStorePicker(user)

        await screen.findByRole('option', { name: /test shopify store/i })

        expect(
            screen.queryByRole('button', { name: /sync to other stores/i }),
        ).not.toBeInTheDocument()
    })

    it('renders sync action when onSyncProfile is provided', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
                onSyncProfile={onSyncProfile}
            />,
        )

        await openStorePicker(user)

        expect(
            await screen.findByRole('button', {
                name: /sync to other stores/i,
            }),
        ).toBeInTheDocument()
    })

    it('calls onSyncProfile when clicking the sync action', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
                onSyncProfile={onSyncProfile}
            />,
        )

        await openStorePicker(user)

        await user.click(
            await screen.findByRole('button', {
                name: /sync to other stores/i,
            }),
        )

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
    })

    it('closes dropdown when clicking the sync action', async () => {
        const onSyncProfile = vi.fn()
        const { user } = render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
                onSyncProfile={onSyncProfile}
            />,
        )

        await openStorePicker(user)

        const syncAction = await screen.findByRole('button', {
            name: /sync to other stores/i,
        })
        const selectedStoreOption = await screen.findByRole('option', {
            name: /test shopify store/i,
        })

        await user.click(syncAction)

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(selectedStoreOption).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /sync to other stores/i,
                }),
            ).not.toBeInTheDocument()
        })
    })
})
