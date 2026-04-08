import client from '@repo/api-resources'
import { userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { renderWithToaster } from 'tests/renderWithToaster'

import RemoveShopifyBilling from '../RemoveShopifyBilling'

const mockedServer = new MockAdapter(client)

describe('<RemoveShopifyBilling />', () => {
    beforeEach(() => {
        mockedServer.reset()
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(200)
    })

    it('should submit the form', async () => {
        const { getByText, getByRole } = renderWithToaster(
            <RemoveShopifyBilling />,
        )

        const button = getByRole('button', { name: 'Remove Shopify Billing' })
        fireEvent.click(button)
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({
                    name: 'remove_shopify_billing',
                    params: {},
                }),
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent(
                'Shopify billing removed succesfully.',
            )
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should disable the submit button when the form is not valid', () => {
        const { getByRole } = renderWithToaster(<RemoveShopifyBilling />)

        const button = getByRole('button', { name: 'Remove Shopify Billing' })
        expect(button).toHaveProperty('disabled')
    })

    it('should display error when backend returns an error', async () => {
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(400)

        renderWithToaster(<RemoveShopifyBilling />)
        const button = screen.getByRole('button', {
            name: 'Remove Shopify Billing',
        })
        userEvent.click(button)
        userEvent.click(screen.getByText('Confirm'))

        await waitFor(() => {
            expect(mockedServer.history.post.length).toBe(1)
            expect(mockedServer.history.post[0].data).toBe(
                JSON.stringify({
                    name: 'remove_shopify_billing',
                    params: {},
                }),
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
