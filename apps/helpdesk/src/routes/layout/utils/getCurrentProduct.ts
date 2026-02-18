import { workflowsRoutes } from 'routes/layout/products/workflows'

import type { ProductConfig } from '../productConfig'
import { Product, productConfig } from '../productConfig'

const isWorkflowsLegacyRoute = (pathname: string) => {
    const workflowsLegacyRoute = Object.values(workflowsRoutes).find(
        ({ path }) => pathname.startsWith(`/app/settings/${path}`),
    )

    return !!workflowsLegacyRoute
}

export function getCurrentProduct(pathname: string): ProductConfig {
    if (isWorkflowsLegacyRoute(pathname)) {
        return productConfig[Product.Workflows]
    }

    for (const product of Object.values(productConfig)) {
        for (const pattern of product.urlPatterns) {
            if (pathname.startsWith(`/app/${pattern}`)) {
                return product
            }
        }
    }

    return productConfig[Product.Inbox]
}
