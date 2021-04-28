import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {SelfServiceView} from '../SelfServiceView'
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

type Props = ComponentProps<typeof SelfServiceView>

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
        report_issue_policy: {
            enabled: false,
        },
        track_order_policy: {
            enabled: false,
        },
        cancel_order_policy: {
            enabled: false,
        },
        return_order_policy: {
            enabled: false,
        },
    }))
}

describe('<SelfServiceView/>', () => {
    let mockUpdateSelfServiceConfigurations = jest.fn(() => Promise.resolve())

    let defaultProps = ({
        shopifyIntegrations: fromJS([]),
        actions: {
            fetchSelfServiceConfigurations: jest.fn(),
            updateSelfServiceConfigurations: mockUpdateSelfServiceConfigurations,
        },
    } as any) as Props

    beforeEach(() => {
        jest.resetAllMocks()

        jest.spyOn(Date.prototype, 'toISOString').mockImplementation(
            () => '2021-01-26T00:30:00Z'
        )
        mockUpdateSelfServiceConfigurations = jest.fn(() => Promise.resolve())
        defaultProps = ({
            shopifyIntegrations: fromJS([]),
            actions: {
                fetchSelfServiceConfigurations: jest.fn(),
                updateSelfServiceConfigurations: mockUpdateSelfServiceConfigurations,
            },
        } as any) as Props
    })

    describe('render()', () => {
        it('should render the default message when there is no active shopify integration', () => {
            const {container} = render(<SelfServiceView {...defaultProps} />)
            expect(container).toMatchSnapshot()
        })

        it('should render a row for each shopify integration, 2 active and 1 inactive ssp services', () => {
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

    describe('ToggleButton.onChange()', () => {
        it('should send an updateSelfServiceConfigurations action and the ssp for the store with id 1 will get deactivated', () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(4)
            const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
                4
            )

            const {container, getAllByTestId} = render(
                <SelfServiceView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                />
            )

            expect(container).toMatchSnapshot()

            fireEvent.click(getAllByTestId('toggle-button')[0]) // selecting the 1st store (id = 1)
            expect(mockUpdateSelfServiceConfigurations.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": "2021-01-26T00:30:00Z",
                    "id": 1,
                    "report_issue_policy": Object {
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": false,
                    },
                    "shop_name": "mystore1",
                    "track_order_policy": Object {
                      "enabled": false,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-01-26T00:29:30Z",
                  },
                ]
            `)
        })

        it('should send an updateSelfServiceConfigurations action and the ssp for the store with id 2 will get activated', () => {
            const shopifyIntegrations = createShopifyIntegrationFixtures(4)
            const selfServiceConfigurations = createSelfServiceConfigurationFixtures(
                4
            )

            const {container, getAllByTestId} = render(
                <SelfServiceView
                    {...defaultProps}
                    shopifyIntegrations={fromJS(shopifyIntegrations)}
                    selfServiceConfigurations={selfServiceConfigurations}
                />
            )

            expect(container).toMatchSnapshot()

            fireEvent.click(getAllByTestId('toggle-button')[1]) // selecting the 2nd store (id = 2)
            expect(mockUpdateSelfServiceConfigurations.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Object {
                    "cancel_order_policy": Object {
                      "enabled": false,
                    },
                    "created_datetime": "2021-01-26T00:29:00Z",
                    "deactivated_datetime": null,
                    "id": 2,
                    "report_issue_policy": Object {
                      "enabled": false,
                    },
                    "return_order_policy": Object {
                      "enabled": false,
                    },
                    "shop_name": "mystore2",
                    "track_order_policy": Object {
                      "enabled": false,
                    },
                    "type": "shopify",
                    "updated_datetime": "2021-01-26T00:29:30Z",
                  },
                ]
            `)
        })
    })
})
