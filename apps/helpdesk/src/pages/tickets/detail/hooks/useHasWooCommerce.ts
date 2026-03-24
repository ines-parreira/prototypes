import { useMemo } from 'react'

import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { getSourcesWithCustomer } from 'state/widgets/selectors'

export default function useHasWooCommerce() {
    const sources = useAppSelector(getSourcesWithCustomer)

    return useMemo(() => {
        const ecommerceData = sources.getIn([
            'ticket',
            'customer',
            'ecommerce_data',
        ]) as Map<string, unknown> | undefined

        if (!ecommerceData) return false

        return ecommerceData.some(
            (entry: any) => entry?.getIn?.(['store', 'type']) === 'woocommerce',
        )
    }, [sources])
}
