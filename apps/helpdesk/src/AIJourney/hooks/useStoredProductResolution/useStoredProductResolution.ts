import { useEffect, useMemo } from 'react'

import { useLastSelectedProduct } from 'AIJourney/hooks/useLastSelectedProduct/useLastSelectedProduct'
import type { Product } from 'constants/integrations/types/shopify'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'

type UseStoredProductResolutionParams = {
    integrationId: number | undefined
    productList: Product[]
    isLoadingProducts: boolean
    selectedProduct: Product | null
    onProductResolved: (product: Product) => void
}

export const useStoredProductResolution = ({
    integrationId,
    productList,
    isLoadingProducts,
    selectedProduct,
    onProductResolved,
}: UseStoredProductResolutionParams) => {
    const { lastSelectedProductId, setLastSelectedProductId } =
        useLastSelectedProduct()

    const storedProductInList = useMemo(
        () =>
            lastSelectedProductId !== null
                ? productList.find((p) => p.id === lastSelectedProductId)
                : undefined,
        [lastSelectedProductId, productList],
    )

    const shouldFetchStoredProduct =
        lastSelectedProductId !== null &&
        !storedProductInList &&
        productList.length > 0 &&
        !isLoadingProducts &&
        !!integrationId

    const { data: fetchedStoredProducts } = useGetProductsByIdsFromIntegration(
        integrationId ?? 0,
        lastSelectedProductId !== null ? [lastSelectedProductId] : [],
        shouldFetchStoredProduct,
    )

    useEffect(() => {
        if (selectedProduct || isLoadingProducts) return

        const resolved =
            storedProductInList ??
            (fetchedStoredProducts?.length
                ? fetchedStoredProducts[0]
                : undefined) ??
            (productList.length > 0 ? productList[0] : undefined)

        if (resolved) {
            onProductResolved(resolved)
        }
    }, [
        productList,
        selectedProduct,
        isLoadingProducts,
        storedProductInList,
        fetchedStoredProducts,
        onProductResolved,
    ])

    return { setLastSelectedProductId }
}
