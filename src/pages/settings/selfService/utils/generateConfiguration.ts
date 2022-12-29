import {
    SelfServiceConfiguration,
    ShopType,
    ReportIssueVariable,
    ShipmentStatuses,
    ReportIssueReasons,
} from '../../../../models/selfServiceConfiguration/types'

export const generateConfiguration = (
    id: number,
    type: ShopType,
    shopName: string
): SelfServiceConfiguration => {
    return {
        id,
        type,
        shop_name: shopName,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        deactivated_datetime: null,
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
                            reasonKey: ReportIssueReasons.REASON_ORDER_DAMAGED,
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
                    conditions: {},
                    description:
                        'Considered when no other conditions are met, for instance if the order status is unavailable or not listed in any of the cases above.',
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
            eligibilities: [],
            exceptions: [],
        },
        cancel_order_policy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        quick_response_policies: [],
    }
}
