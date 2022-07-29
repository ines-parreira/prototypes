import {PRODUCT_BANNER_KEY} from '../constants'
import {ProductBannerItem} from './ProductBannerItem'

export type ProductBannerRecord = {
    [P in PRODUCT_BANNER_KEY]?: ProductBannerItem
}
