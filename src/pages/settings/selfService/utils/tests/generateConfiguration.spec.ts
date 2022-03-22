import {generateConfiguration} from '../generateConfiguration'
import {
    ReportIssueVariable,
    ShipmentStatuses,
} from '../../../../../models/selfServiceConfiguration/types'

describe('generateConfiguration()', () => {
    it('should generate a base self_service_configuration entity', () => {
        const id = 1 // FIXME: remove the need to provide any id value
        const shopName = 'my-shop'
        const shopType = 'shopify'

        expect(generateConfiguration(id, shopType, shopName)).toEqual({
            id,
            shop_name: shopName,
            type: shopType,
            updated_datetime: expect.any(String),
            created_datetime: expect.any(String),
            deactivated_datetime: null,
            quick_response_policies: [],
            report_issue_policy: {
                enabled: true,
                cases: [
                    {
                        title: 'Delivered',
                        description: '',
                        conditions: {
                            and: [
                                {
                                    or: [
                                        {
                                            in: [
                                                {
                                                    var: ReportIssueVariable.SHIPMENT_STATUS,
                                                },
                                                [ShipmentStatuses.DELIVERED],
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        reasons: [
                            'reasonIncorrectItems',
                            'reasonPastExpectedDeliveryDate',
                            'reasonOrderDamaged',
                            'reasonOther',
                        ],
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
                                                    var: ReportIssueVariable.SHIPMENT_STATUS,
                                                },
                                                [
                                                    ShipmentStatuses.IN_TRANSIT,
                                                    ShipmentStatuses.OUT_FOR_DELIVERY,
                                                    ShipmentStatuses.ATTEMPTED_DELIVERY,
                                                    ShipmentStatuses.READY_FOR_PICKUP,
                                                    ShipmentStatuses.FAILURE,
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
                        description:
                            'Considered when no other conditions are met, for instance if the order status is unavailable or not listed in any of the cases above.',
                        conditions: {},
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
            track_order_policy: {
                enabled: true,
            },
            return_order_policy: {
                enabled: true,
                exceptions: [],
                eligibilities: [],
            },
            cancel_order_policy: {
                enabled: true,
                exceptions: [],
                eligibilities: [],
            },
        })
    })
})
