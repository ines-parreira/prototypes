import {SelfServiceConfiguration} from '../../../../state/self_service/types'

export const generateConfiguration = (
    id: number,
    type: 'shopify', // FIXME: use an enum instead
    shopName: string
): SelfServiceConfiguration => {
    return {
        id,
        type,
        shop_name: shopName,
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        deactivated_datetime: null,
    }
}
