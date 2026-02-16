import type { ProductConfig } from '../productConfig'
import { Product, productConfig } from '../productConfig'

export function getCurrentProduct(pathname: string): ProductConfig {
    for (const product of Object.values(productConfig)) {
        for (const pattern of product.urlPatterns) {
            if (pathname.startsWith(`/app/${pattern}`)) {
                return product
            }
        }
    }

    return productConfig[Product.Inbox]
}
