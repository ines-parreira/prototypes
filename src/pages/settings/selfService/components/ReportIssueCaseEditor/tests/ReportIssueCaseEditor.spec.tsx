import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import {useRouteMatch} from 'react-router-dom'

import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {ShopType} from '../../../../../../state/self_service/types'
import {generateConfiguration} from '../../../utils/generateConfiguration'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {useReorderDnD} from '../../../../../settings/helpCenter/hooks/useReorderDnD'
import {updateSelfServiceConfigurations} from '../../../../../../state/self_service/actions'

import ReportIssueCaseEditor from '../ReportIssueCaseEditor'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('react-router')
jest.mock('../../../../../settings/helpCenter/hooks/useReorderDnD')
jest.mock('../../../../../../state/self_service/actions')

const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
const useReorderDnDMock = useReorderDnD as jest.MockedFunction<
    typeof useReorderDnD
>
const updateSelfServiceConfigurationsMock = updateSelfServiceConfigurations as jest.MockedFunction<
    typeof updateSelfServiceConfigurations
>

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
    return Array.from({length}, (_, i) =>
        generateConfiguration(i + 1, 'shopify' as ShopType, `mystore${i + 1}`)
    )
}

describe('<ReportIssueCaseEditor />', () => {
    const shopifyIntegrations = createShopifyIntegrationFixtures(4)
    const selfServiceConfigurations = createSelfServiceConfigurationFixtures(4)

    beforeEach(() => {
        useReorderDnDMock.mockReturnValue({
            dragRef: {current: null},
            dropRef: {current: null},
            handlerId: null,
            isDragging: false,
        })
    })

    beforeEach(() => {
        useRouteMatchMock.mockReturnValue({
            isExact: false,
            path: '',
            url: '',
            params: {
                shopName: shopifyIntegrations[0]['meta']['shop_name'],
                integrationType: 'shopify',
                caseIndex: '0',
            },
        })
    })

    describe('non-fallback case', () => {
        it('should render correctly', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        selfService: {
                            loading: false,
                            self_service_configurations: selfServiceConfigurations,
                        },
                    })}
                >
                    <ReportIssueCaseEditor />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })

        it('should save changes', () => {
            render(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        selfService: {
                            loading: false,
                            self_service_configurations: selfServiceConfigurations,
                        },
                    })}
                >
                    <ReportIssueCaseEditor />
                </Provider>
            )

            userEvent.click(screen.getByText('Add new reason'))
            userEvent.click(screen.getByText("I didn't get my refund"))

            userEvent.click(screen.getAllByText('is one of')[0])
            userEvent.click(screen.getByText('is empty'))

            userEvent.click(screen.getByText('Save changes'))

            expect(updateSelfServiceConfigurationsMock).toBeCalledWith({
                ...selfServiceConfigurations[0],
                report_issue_policy: {
                    enabled: true,
                    cases: [
                        {
                            conditions: {
                                and: [
                                    {
                                        or: [
                                            {
                                                '===': [
                                                    {var: 'shipment_status'},
                                                    null,
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            description: '',
                            reasons: [
                                'reasonIncorrectItems',
                                'reasonPastExpectedDeliveryDate',
                                'reasonOrderDamaged',
                                'reasonOther',
                                'reasonDidNotReceiveRefund',
                            ],
                            title: 'Delivered',
                        },
                        {
                            title: 'Delivering',
                            description: '',
                            conditions: {
                                and: [
                                    {
                                        or: [
                                            {
                                                in: [
                                                    {
                                                        var: 'shipment_status',
                                                    },
                                                    [
                                                        'in_transit',
                                                        'out_for_delivery',
                                                        'attempted_delivery',
                                                        'ready_for_pickup',
                                                        'failure',
                                                    ],
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            reasons: [
                                'reasonOrderStuckInTransit',
                                'reasonChangeShippingAddress',
                                'reasonOther',
                            ],
                        },
                        {
                            title: 'Fallback',
                            conditions: {},
                            description:
                                'Considered when no other conditions are met, for instance if the order status is unavailable or not listed in any of the cases above.',
                            reasons: [
                                'reasonPastExpectedDeliveryDate',
                                'reasonChangeShippingAddress',
                                'reasonEditOrder',
                                'reasonForgotToUseDiscount',
                                'reasonOther',
                            ],
                        },
                    ],
                },
            })
        })
    })

    describe('fallback case', () => {
        beforeEach(() => {
            useRouteMatchMock.mockReturnValue({
                isExact: false,
                path: '',
                url: '',
                params: {
                    shopName: shopifyIntegrations[0]['meta']['shop_name'],
                    integrationType: 'shopify',
                    caseIndex: '2',
                },
            })
        })

        it('should render correctly', () => {
            const {container} = render(
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: shopifyIntegrations,
                        }),
                        selfService: {
                            loading: false,
                            self_service_configurations: selfServiceConfigurations,
                        },
                    })}
                >
                    <ReportIssueCaseEditor />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
