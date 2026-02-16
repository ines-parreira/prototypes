import { useMemo } from 'react'

import { useLocation } from 'react-router'

import { getCurrentProduct } from 'routes/layout/utils/getCurrentProduct'

export function useCurrentRouteProduct() {
    const { pathname } = useLocation()

    const currentProduct = useMemo(
        () => getCurrentProduct(pathname),
        [pathname],
    )

    return currentProduct
}
