import { useEffect, useMemo } from 'react'

import type { RawProductData } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import {
    getProducts,
    getProductsLoading,
    getSliceState,
    getSortedProducts,
    getSorting,
    productsLoading,
    setProducts,
    sortingLoaded,
    sortingLoading,
} from 'domains/reporting/state/ui/stats/productInsightsSlice'
import {
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    PRODUCT_THUMBNAIL_FIELD,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'

export const useSortedProducts = () => {
    const { sorting } = useAppSelector(getSliceState)
    const products = useAppSelector(getSortedProducts)

    return { isLoading: sorting.isLoading, products }
}

export const useProductsSorting = (
    column: ProductInsightsTableColumns,
    data: { value: number | null; allData: RawProductData[] } | null,
    isFetching: boolean,
) => {
    const dispatch = useAppDispatch()
    const sorting = useAppSelector(getSorting)
    const isProductsLoading = useAppSelector(getProductsLoading)
    const productsInState = useAppSelector(getProducts)

    const loadedProducts = useMemo(
        () =>
            data?.allData.map((item) => ({
                id: item[PRODUCT_ID_FIELD],
                name: item[PRODUCT_NAME_FIELD],
                thumbnail_url: item[PRODUCT_THUMBNAIL_FIELD] ?? undefined,
            })) ?? [],
        [data],
    )

    useEffect(() => {
        if (
            column === ProductInsightsTableColumns.Product &&
            isProductsLoading &&
            !isFetching
        ) {
            dispatch(setProducts(loadedProducts))
        } else if (
            column === ProductInsightsTableColumns.Product &&
            loadedProducts.length > 0 &&
            loadedProducts.length !== productsInState.length
        ) {
            dispatch(setProducts(loadedProducts))
        }
    }, [
        column,
        dispatch,
        productsInState,
        sorting,
        isProductsLoading,
        loadedProducts,
        loadedProducts.length,
        isFetching,
    ])

    useEffect(() => {
        if (
            column === ProductInsightsTableColumns.Product &&
            !isProductsLoading &&
            isFetching
        ) {
            dispatch(productsLoading())
        }
    }, [column, dispatch, isProductsLoading, isFetching])

    useEffect(() => {
        if (sorting.field === column && sorting.isLoading && !isFetching) {
            const sortedProducts = data
                ? data.allData.map((item) => item[PRODUCT_ID_FIELD])
                : []

            dispatch(sortingLoaded(sortedProducts))
        }
    }, [column, dispatch, sorting, data, isFetching])

    useEffect(() => {
        if (sorting.field === column && !sorting.isLoading && isFetching) {
            dispatch(sortingLoading())
        }
    }, [column, dispatch, sorting, isFetching])

    return { isLoading: isFetching }
}
