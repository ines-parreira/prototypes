import { fireEvent, render, waitFor } from '@testing-library/react'

import * as shopifyModels from 'models/integration/resources/shopify'
import { ShopifyIntegration, ShopifyTags } from 'models/integration/types'
import { ShopifyCustomerTagsInput } from 'pages/convert/campaigns/components/ContactCaptureForm/ShopifyCustomerTagsInput'
import * as integrationHook from 'pages/convert/campaigns/containers/IntegrationProvider'

jest.mock('models/integration/resources/shopify')

describe('<ShopifyCustomerTagsInput />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('fetches Shopify customer tags on focus (default behavior)', async () => {
        jest.spyOn(integrationHook, 'useIntegrationContext').mockReturnValue({
            shopifyIntegration: { id: 1 } as ShopifyIntegration,
        })
        const mockFetch = jest
            .spyOn(shopifyModels, 'fetchShopTags')
            .mockResolvedValue(['foo', 'bar'])

        const { getByPlaceholderText } = render(
            <ShopifyCustomerTagsInput value={[]} onChange={() => {}} />,
        )

        const input = getByPlaceholderText('Add tags...')
        fireEvent.focus(input)

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(1, ShopifyTags.customers)
        })
    })

    it('does not fetch tags if shouldFetchOnFocus is false', async () => {
        jest.spyOn(integrationHook, 'useIntegrationContext').mockReturnValue({
            shopifyIntegration: { id: 2 } as ShopifyIntegration,
        })

        const mockFetch = jest.spyOn(shopifyModels, 'fetchShopTags')

        const { getByPlaceholderText } = render(
            <ShopifyCustomerTagsInput
                value={[]}
                onChange={() => {}}
                shouldFetchOnFocus={false}
            />,
        )

        const input = getByPlaceholderText('Add tags...')
        fireEvent.focus(input)

        await waitFor(() => {
            expect(mockFetch).not.toHaveBeenCalled()
        })
    })

    it('uses provided singular and plural texts in placeholder', () => {
        jest.spyOn(integrationHook, 'useIntegrationContext').mockReturnValue({
            shopifyIntegration: { id: 3 } as ShopifyIntegration,
        })

        const { getByPlaceholderText } = render(
            <ShopifyCustomerTagsInput
                value={[]}
                onChange={() => {}}
                singularText="label"
                pluralText="labels"
            />,
        )

        expect(getByPlaceholderText('Add labels...')).toBeInTheDocument()
    })
})
