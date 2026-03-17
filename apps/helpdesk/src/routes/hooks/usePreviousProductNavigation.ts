import { useEffect, useRef } from 'react'

import { useLocation } from 'react-router-dom'

import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { SidebarContentType } from 'routes/layout/productConfig'

export function usePreviousProductNavigation() {
    const { pathname } = useLocation()
    const currentProduct = useCurrentRouteProduct()

    const prevNonStickyPathnameRef = useRef(
        currentProduct.sidebarContentType !== SidebarContentType.Sticky
            ? pathname
            : null,
    )

    useEffect(() => {
        if (currentProduct.sidebarContentType !== SidebarContentType.Sticky) {
            prevNonStickyPathnameRef.current = pathname
        }
    }, [currentProduct, pathname])

    return prevNonStickyPathnameRef.current
}
