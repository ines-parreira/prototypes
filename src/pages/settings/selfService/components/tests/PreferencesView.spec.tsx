import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {PreferencesView} from '../PreferencesView'
import {ShopType} from '../../../../../state/self_service/types'

jest.mock('../../../../common/components/ToggleButton', () => {
    return ({
        value,
        onChange,
    }: {
        value: string
        onChange: (param: boolean) => null
    }) => {
        return (
            <div
                data-testid="toggle-button"
                onClick={() => {
                    onChange(!Boolean(value))
                }}
            >{`ToggleButtonMock value=${value}`}</div>
        )
    }
})

type Props = ComponentProps<typeof PreferencesView>

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
        type: 'shopify' as ShopType,
        shop_name: `mystore${i + 1}`,
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
        },
        return_order_policy: {
            enabled: i % 2 === 0,
        },
    }))
}

describe('<SelfServicePreferencesView/>', () => {
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should render the 4 policy rows, 2 active and 2 inactive', () => {
            const matchProp = {
                params: {
                    shopName: shopifyIntegrations[0]['meta']['shop_name'],
                    integrationType: 'shopify',
                },
                isExact: true,
                path: 'foo/',
                url: 'foo/',
            }

            const {container} = render(
                <PreferencesView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                    match={matchProp}
                />
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('ToggleButton.onChange()', () => {
        it('should deactivate the report issue policy on the mystore3 store', () => {
            // make sure return order policy is enabled before toggling
            expect(
                selfServiceConfigurations[2]['return_order_policy']['enabled']
            ).toBeTruthy()

            const matchProp = {
                params: {
                    shopName: shopifyIntegrations[2]['meta']['shop_name'],
                    integrationType: 'shopify',
                },
                isExact: true,
                path: 'foo/',
                url: 'foo/',
            }

            const {container, getAllByTestId} = render(
                <PreferencesView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                    match={matchProp}
                />
            )

            expect(container).toMatchSnapshot()

            fireEvent.click(getAllByTestId('toggle-button')[2]) // selecting the return order policy toggle button
            expect(mockUpdateSelfServiceConfigurations.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": null,
                    "id": 3,
                    "report_issue_policy": Object {
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": false,
                    },
                    "shop_name": "mystore3",
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
