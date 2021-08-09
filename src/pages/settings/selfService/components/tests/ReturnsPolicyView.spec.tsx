import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {fromJS} from 'immutable'

import {ReturnsPolicyView} from '../ReturnsPolicyView'
import {ShopType} from '../../../../../state/self_service/types'

type Props = ComponentProps<typeof ReturnsPolicyView>

const createShopifyIntegrationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify',
        meta: {
            shop_name: `myStore${i + 1}`,
        },
        uri: `/api/integrations/${i + 1}/`,
    }))
}

const createSelfServiceConfigurationFixtures = (length: number) => {
    return Array.from({length}, (_, i) => ({
        id: i + 1,
        type: 'shopify' as ShopType,
        shop_name: `myStore${i + 1}`,
        created_datetime: '2021-01-26T00:29:00Z',
        updated_datetime: '2021-01-26T00:29:30Z',
        deactivated_datetime: i % 2 === 0 ? null : '2021-01-26T00:30:00Z',
        // track_order && return_order policies enabled for mystore1 and mystore3
        // report_issue && cancel_order policies enabled for mystore2 and mystore4
        report_issue_policy: {
            enabled: i % 2 !== 0,
            cases: [],
        },
        track_order_policy: {
            enabled: i % 2 === 0,
        },
        cancel_order_policy: {
            enabled: i % 2 !== 0,
        },
        return_order_policy: {
            enabled: i % 2 === 0,
            eligibilities: [
                {
                    key: 'order_created_at',
                    value: '15',
                    operator: 'lt',
                },
            ],
        },
    }))
}

describe('<ReturnsPolicyView />', () => {
    const mockUpdateSelfServiceConfigurations = jest.fn(() => Promise.resolve())
    const mockFetchSelfServiceConfiguration = jest.fn(() => Promise.resolve())

    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    const defaultProps = ({
        shopifyIntegrations: fromJS([]),
        selfServiceConfigurations: [],
        actions: {
            fetchSelfServiceConfigurations: jest.fn(() => Promise.resolve()),
            fetchSelfServiceConfiguration: mockFetchSelfServiceConfiguration,
            updateSelfServiceConfigurations: mockUpdateSelfServiceConfigurations,
        },
        match: {params: {}},
    } as any) as Props

    describe('render()', () => {
        it('should render the select field', () => {
            const matchProp = {
                params: {
                    shopName: 'myStore1',
                    integrationType: 'shopify',
                },
                isExact: true,
                path: 'foo/',
                url: 'foo/',
            }

            const {container} = render(
                <ReturnsPolicyView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                    match={matchProp}
                />
            )
            expect(container).toMatchSnapshot()
        })
    })
})
