import {generateConfiguration} from '../generateConfiguration'
import {
    ReportIssueReasons,
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
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_INCORRECT_ITEMS,
                            },
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_PAST_EXPECTED_DELIVERY_DATE,
                            },
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_ORDER_DAMAGED,
                            },
                            {
                                reasonKey: ReportIssueReasons.REASON_OTHER,
                            },
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
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_ORDER_STUCK_IN_TRANSIT,
                            },
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_CHANGE_SHIPPING_ADDRESS,
                            },
                            {
                                reasonKey: ReportIssueReasons.REASON_OTHER,
                            },
                        ],
                    },
                    {
                        title: 'Fallback',
                        description:
                            'Considered when no other conditions are met, for instance if the order status is unavailable or not listed in any of the cases above.',
                        conditions: {},
                        reasons: [
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_PAST_EXPECTED_DELIVERY_DATE,
                            },
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_CHANGE_SHIPPING_ADDRESS,
                            },
                            {
                                reasonKey: ReportIssueReasons.REASON_EDIT_ORDER,
                            },
                            {
                                reasonKey:
                                    ReportIssueReasons.REASON_FORGOT_TO_USE_DISCOUNT,
                            },
                            {
                                reasonKey: ReportIssueReasons.REASON_OTHER,
                            },
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
