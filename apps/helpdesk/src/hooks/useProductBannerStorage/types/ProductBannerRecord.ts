import type { PRODUCT_BANNER_KEY } from '../constants'
import type { ProductBannerItem } from './ProductBannerItem'

export type ProductBannerRecord = {
    [P in PRODUCT_BANNER_KEY]?: ProductBannerItem
}
