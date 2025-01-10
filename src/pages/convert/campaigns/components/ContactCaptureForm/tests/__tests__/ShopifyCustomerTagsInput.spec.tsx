import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import * as shopifyModels from 'models/integration/resources/shopify'
import {ShopifyIntegration, ShopifyTags} from 'models/integration/types'
import {ShopifyCustomerTagsInput} from 'pages/convert/campaigns/components/ContactCaptureForm/ShopifyCustomerTagsInput'
import * as integrationHook from 'pages/convert/campaigns/containers/IntegrationProvider'

jest.mock('models/integration/resources/shopify')

describe('<ShopifyCustomerTagsInput />', () => {
    it('should fetch the shopify customer tags when focused', () => {
        jest.spyOn(integrationHook, 'useIntegrationContext').mockImplementation(
            () => ({
                shopifyIntegration: {
                    id: 1,
                } as ShopifyIntegration,
            })
        )
        const mockFetchShopTags = jest.spyOn(shopifyModels, 'fetchShopTags')
        mockFetchShopTags.mockResolvedValue(['foo', 'bar'])
        const {getByPlaceholderText} = render(
            <ShopifyCustomerTagsInput
                value={[]}
                onChange={(__) => {}}
                shopifyIntegration={{id: 1} as ShopifyIntegration}
            />
        )
        const input = getByPlaceholderText('Add tags...')

        fireEvent.focus(input)

        expect(mockFetchShopTags).toHaveBeenCalledWith(1, ShopifyTags.customers)
    })
})
