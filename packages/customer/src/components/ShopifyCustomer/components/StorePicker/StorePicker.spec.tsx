import { screen, waitFor } from '@testing-library/react'

import type { Integration } from '@gorgias/helpdesk-types'

import { render } from '../../../../tests/render.utils'
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

        await user.click(screen.getByRole('textbox'))

        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: /test shopify store/i }),
            ).toBeInTheDocument()
        })

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

        await user.click(screen.getByRole('textbox'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync to other stores/i }),
            ).toBeInTheDocument()
        })
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

        await user.click(screen.getByRole('textbox'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync to other stores/i }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: /sync to other stores/i }),
        )

        expect(onSyncProfile).toHaveBeenCalledTimes(1)
    })

    it('closes dropdown when clicking the sync action', async () => {
        const { user } = render(
            <StorePicker
                integrations={mockIntegrations}
                selectedIntegrationId={1}
                onChange={vi.fn()}
                onSyncProfile={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('textbox'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync to other stores/i }),
            ).toBeInTheDocument()
        })

        await user.click(
            screen.getByRole('button', { name: /sync to other stores/i }),
        )

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: /sync to other stores/i }),
            ).not.toBeInTheDocument()
        })
    })
})
