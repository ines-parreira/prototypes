import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {SelfServiceView} from '../SelfServiceView'

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `mystore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        shop_name: `mystore${i + 1}`,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        deactivated_datetime: i % 2 === 0 ? null : new Date().toISOString(),
    }))
}

describe('<SelfServiceView/>', () => {
    const defaultProps = {
        shopifyIntegrations: fromJS([]),
        actions: {
            fetchSelfServiceConfigurations: jest.fn(),
        },
    } as any

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show a row for each shopify integration', () => {
        const shopifyIntegrations = createShopifyIntegrationFixtures(3)
        const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
            3
        )
        const {container} = render(
            <SelfServiceView
                {...defaultProps}
                shopifyIntegrations={fromJS(shopifyIntegrations)}
                selfServiceConfigurations={selfServiceConfigurations}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
