import React from 'react'

import client from '@repo/api-resources'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { renderWithToaster } from 'tests/renderWithToaster'

import CreditShopifyBillingIntegration from '../CreditShopifyBillingIntegration'

const mockedServer = new MockAdapter(client)

describe('<CreditShopifyBillingIntegration />', () => {
    beforeEach(() => {
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(200)
    })

    it('should render the form', () => {
        const { container } = renderWithToaster(
            <CreditShopifyBillingIntegration />,
        )
        expect(container).toMatchSnapshot()
    })

    it('should submit the form', async () => {
        const { getByText, getByLabelText } = renderWithToaster(
            <CreditShopifyBillingIntegration />,
        )

        fireEvent.change(getByLabelText('Description'), {
            target: { value: 'One month free of charge for a loyal customer' },
        })
        fireEvent.change(getByLabelText('Credit amount'), {
            target: { value: '360.49' },
        })

        fireEvent.click(getByText('Add credit'))
        fireEvent.click(getByText('Confirm'))

        expect(mockedServer.history.post[0].data).toBe(
            JSON.stringify({
                name: 'credit_shopify_store_used_for_billing',
                params: {
                    amount: 360.49,
                    description:
                        'One month free of charge for a loyal customer',
                },
            }),
        )

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent(
                'Amount successfully credited to Shopify account.',
            )
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should disable the submit button when form is not valid', () => {
        const { getByRole, getByLabelText } = renderWithToaster(
            <CreditShopifyBillingIntegration />,
        )

        fireEvent.change(getByLabelText('Description'), {
            target: { value: 'One month free of charge for a loyal customer' },
        })

        const button = getByRole('button', { name: 'Add credit' })

        expect(button).toHaveProperty('disabled')
    })

    it('should fail the request by rendering a notification', async () => {
        const errorMessage = 'No es possible'
        mockedServer.onPost('/api/integrations/shopify/tasks').reply(400, {
            error: { msg: errorMessage },
        })

        const { getByText, getByLabelText } = renderWithToaster(
            <CreditShopifyBillingIntegration />,
        )

        fireEvent.change(getByLabelText('Description'), {
            target: { value: 'One month free of charge for a loyal customer' },
        })
        fireEvent.change(getByLabelText('Credit amount'), {
            target: { value: '360' },
        })

        fireEvent.click(getByText('Add credit'))
        fireEvent.click(getByText('Confirm'))

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent(errorMessage)
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
