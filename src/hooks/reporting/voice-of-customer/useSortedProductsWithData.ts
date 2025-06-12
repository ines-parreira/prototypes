import { useEffect, useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTicketCountPerProductWithEnrichment } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { getSliceState, setProducts } from 'state/ui/stats/productInsightsSlice'
import {
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    PRODUCT_THUMBNAIL_FIELD,
} from 'state/ui/stats/productsPerTicketSlice'

export const useSortedProductsWithData = () => {
    const dispatch = useAppDispatch()
    const { products, isLoading } = useAppSelector(getSliceState)
    const statsFilters = useStatsFilters()
    const { data, isFetching } = useTicketCountPerProductWithEnrichment(
        statsFilters.cleanStatsFilters,
        statsFilters.userTimezone,
        OrderDirection.Desc,
    )

    const loadedProducts = useMemo(() => {
        return (
            data?.allData.map((item) => ({
                id: item[PRODUCT_ID_FIELD],
                name: item[PRODUCT_NAME_FIELD],
                thumbnail_url: item[PRODUCT_THUMBNAIL_FIELD],
            })) ?? []
        )
    }, [data])

    useEffect(() => {
        if (isLoading && loadedProducts.length > 0) {
            dispatch(setProducts(loadedProducts))
        }
    }, [dispatch, products, isLoading, loadedProducts, isFetching])

    return { isLoading: isFetching, products }
}
