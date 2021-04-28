import {
    SelfServiceConfiguration,
    ShopType,
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
