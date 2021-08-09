import {
    SelfServiceConfiguration,
    ShopType,
    ReportIssueVariable,
    ShipmentStatuses,
} from '../../../../state/self_service/types'

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
                                                var:
                                                    ReportIssueVariable.SHIPMENT_STATUS,
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
                                                var:
                                                    ReportIssueVariable.SHIPMENT_STATUS,
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
        track_order_policy: {
            enabled: true,
        },
        return_order_policy: {
            enabled: true,
        },
        cancel_order_policy: {
            enabled: true,
        },
    }
}
