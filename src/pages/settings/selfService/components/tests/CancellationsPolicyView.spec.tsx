import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {fromJS} from 'immutable'

import {CancellationsPolicyView} from '../CancellationsPolicyView'
import {ShopType} from '../../../../../state/self_service/types'

type Props = ComponentProps<typeof CancellationsPolicyView>

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
        },
        track_order_policy: {
            enabled: i % 2 === 0,
        },
        cancel_order_policy: {
            enabled: i % 2 !== 0,
            eligibilities: [
                {
                    key: 'gorgias_order_status',
                    value: 'unfulfilled',
                    operator: 'eq',
                },
            ],
        },
        return_order_policy: {
            enabled: i % 2 === 0,
        },
    }))
}

describe('<CancellationsPolicyView/>', () => {
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
        it('should render the eligibility window option as unfulfilled', () => {
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
                <CancellationsPolicyView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                    match={matchProp}
                />
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('onSubmit()', () => {
        it('should set the eligibility option to processing fulfillment and make the update request', () => {
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
                <CancellationsPolicyView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                    match={matchProp}
                />
            )

            expect(container).toMatchSnapshot()

            const newlySelectedOption = screen.getByText(
                /Processing Fulfillment/
            )
            const submitButton = screen.getByText(/Save changes/)

            fireEvent.click(newlySelectedOption)
            fireEvent.click(submitButton)

            expect(mockUpdateSelfServiceConfigurations.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "eligibilities": Array [
                        Object {
                          "key": "gorgias_order_status",
                          "operator": "eq",
                          "value": "processing_fulfillment",
                        },
                      ],
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": null,
                    "id": 1,
                    "report_issue_policy": Object {
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": true,
                    },
                    "shop_name": "myStore1",
                    "track_order_policy": Object {
                      "enabled": true,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-01-26T00:29:30Z",
                  },
                ]
            `)
        })
    })
})
