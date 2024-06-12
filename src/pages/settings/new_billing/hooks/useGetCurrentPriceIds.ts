import useAppSelector from 'hooks/useAppSelector'
import {getCurrentPlansByProduct} from 'state/billing/selectors'

export const useCurrentPriceIds = (): string[] => {
    const currentProducts = useAppSelector(getCurrentPlansByProduct)

    const currentPriceIds: string[] = currentProducts
        ? [
              currentProducts.helpdesk?.price_id,
              currentProducts.automation?.price_id || '',
              currentProducts.convert?.price_id || '',
          ].filter(Boolean)
        : []

    return currentPriceIds
}
