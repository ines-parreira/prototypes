import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {GorgiasChatIntegrationSelfServiceComponent} from '../GorgiasChatIntegrationSelfService'
import {IntegrationType} from '../../../../../../models/integration/types'

const SHOP_DOMAIN_1 = 'myshop1.myshopify.com'
const SHOP_DOMAIN_2 = 'myshop2.myshopify.com'

const shopifyIntegrationsSample = fromJS([
    {
        id: 1,
        name: 'My shop 1',
        meta: {
            shop_domain: SHOP_DOMAIN_1,
        },
    },
    {
        id: 2,
        name: 'My shop 2',
        meta: {
            shop_domain: SHOP_DOMAIN_2,
        },
    },
])

type Props = ComponentProps<typeof GorgiasChatIntegrationSelfServiceComponent>
const mockStore = configureMockStore([thunk])
jest.mock('../../../../../common/components/ToggleButton', () => {
    return ({value, onChange}: {value: string; onChange: () => void}) => {
        return (
            <div
                data-testid="toggle-button"
                onClick={onChange}
            >{`ToggleButtonMock value=${value}`}</div>
        )
    }
})

describe('<GorgiasChatIntegrationSelfService/>', () => {
    const integration: Map<any, any> = fromJS({
        id: 7,
        name: 'my chat integration',
        type: IntegrationType.GorgiasChatIntegrationType,
        meta: {
            self_service: {
                enabled: false,
            },
        },
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    }) as Map<any, any>

    let mockUpdateOrCreateIntegration = jest.fn(() => Promise.resolve())

    beforeEach(() => {
        jest.resetAllMocks()
        mockUpdateOrCreateIntegration = jest.fn(() => Promise.resolve())
    })

    const props = ({
        store: mockStore({}),
        integration: integration,
        updateOrCreateIntegration: mockUpdateOrCreateIntegration,
        shopifyIntegrations: fromJS([]),
    } as any) as Props

    describe('render()', () => {
        it.each([
            fromJS([]),
            fromJS([
                {
                    id: 2,
                    name: 'My shop 2',
                    meta: {
                        shop_domain: 'not_a_shopify_domain',
                    },
                },
            ]),
        ])(
            'should render the default message when there is no shopify integration - %#',
            (shopifyIntegrations) => {
                const {container} = render(
                    <GorgiasChatIntegrationSelfServiceComponent
                        {...props}
                        shopifyIntegrations={shopifyIntegrations}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            }
        )

        it('should render the list of shopify integrations with 2/2 that has the SSP enabled', () => {
            const testProps = ({
                store: mockStore({}),
                integration: integration.setIn(
                    ['meta', 'self_service', 'enabled'],
                    true
                ),
                updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                shopifyIntegrations: shopifyIntegrationsSample,
            } as any) as Props

            const {container} = render(
                <GorgiasChatIntegrationSelfServiceComponent {...testProps} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the list of shopify integrations with 1/2 that has the SSP enabled (with self_service.enabled: true)', () => {
            const testProps = ({
                store: mockStore({}),
                integration: integration.setIn(
                    ['meta', 'self_service'],
                    fromJS({
                        enabled: false,
                        configurations: [
                            {
                                base_url: SHOP_DOMAIN_1,
                                enabled: true,
                                integration_id: 1,
                            },
                            {
                                base_url: SHOP_DOMAIN_2,
                                enabled: false,
                                integration_id: 2,
                            },
                        ],
                    })
                ),
                updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                shopifyIntegrations: shopifyIntegrationsSample,
            } as any) as Props

            const {container} = render(
                <GorgiasChatIntegrationSelfServiceComponent {...testProps} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it.each([true, false])(
            'should render the list of shopify integrations with the value taken from the meta configuration (ignoring the self_service.enabled value) - enabled = %s',
            (enabled) => {
                const testProps = ({
                    store: mockStore({}),
                    integration: integration.setIn(
                        ['meta', 'self_service'],
                        fromJS({
                            enabled,
                            configurations: [
                                {
                                    base_url: SHOP_DOMAIN_1,
                                    enabled: false,
                                    integration_id: 1,
                                },
                                {
                                    base_url: SHOP_DOMAIN_2,
                                    enabled: true,
                                    integration_id: 2,
                                },
                            ],
                        })
                    ),
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                    shopifyIntegrations: shopifyIntegrationsSample,
                } as any) as Props

                const {container} = render(
                    <GorgiasChatIntegrationSelfServiceComponent
                        {...testProps}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })

    describe('onToggleSelfService()', () => {
        it('should call the updateOrCreateIntegration with the right values and set self_service.enabled to false', () => {
            const testProps = ({
                store: mockStore({}),
                integration: integration.setIn(
                    ['meta', 'self_service'],
                    fromJS({
                        enabled: true,
                        configurations: [
                            {
                                base_url: SHOP_DOMAIN_1,
                                enabled: false,
                                integration_id: 1,
                            },
                            {
                                base_url: SHOP_DOMAIN_2,
                                enabled: true,
                                integration_id: 2,
                            },
                        ],
                    })
                ),
                updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                shopifyIntegrations: shopifyIntegrationsSample,
            } as any) as Props

            const {container, getAllByTestId} = render(
                <GorgiasChatIntegrationSelfServiceComponent {...testProps} />
            )

            fireEvent.click(getAllByTestId('toggle-button')[0])
            expect(mockUpdateOrCreateIntegration.mock.calls[0])
                .toMatchInlineSnapshot(`
                Array [
                  Immutable.Map {
                    "id": 7,
                    "meta": Immutable.Map {
                      "self_service": Immutable.Map {
                        "enabled": false,
                        "configurations": Immutable.List [
                          Immutable.Map {
                            "base_url": "myshop1.myshopify.com",
                            "integration_id": 1,
                            "enabled": true,
                          },
                          Immutable.Map {
                            "base_url": "myshop2.myshopify.com",
                            "integration_id": 2,
                            "enabled": true,
                          },
                        ],
                      },
                    },
                  },
                ]
            `)

            expect(container).toMatchSnapshot()
        })
    })
})
