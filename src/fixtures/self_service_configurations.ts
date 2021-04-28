import {ShopType} from '../state/self_service/types'

export const selfServiceConfiguration1 = {
    id: 1,
    type: 'shopify' as ShopType,
    shop_name: 'mystore',
    created_datetime: '2021-02-07T06:07:46.097905+00:00',
    updated_datetime: '2021-02-07T09:07:46.097905+00:00',
    deactivated_datetime: null,
    report_issue_policy: {
        enabled: true,
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

export const selfServiceConfiguration2 = {
    id: 2,
    type: 'shopify' as ShopType,
    shop_name: 'otherstore',
    created_datetime: '2021-02-20T08:15:46.097905+00:00',
    updated_datetime: '2021-02-20T08:20:46.097905+00:00',
    deactivated_datetime: '2021-02-20T08:30:46.097905+00:00',
    report_issue_policy: {
        enabled: true,
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

export const selfServiceState = {
    self_service_configurations: [
        selfServiceConfiguration1,
        selfServiceConfiguration2,
    ],
    loading: false,
}

export const updatedSelfServiceConfiguration1 = {
    ...selfServiceConfiguration1,
    deactivated_datetime: '2021-03-01T00:04:20.097905+00:00',
}
