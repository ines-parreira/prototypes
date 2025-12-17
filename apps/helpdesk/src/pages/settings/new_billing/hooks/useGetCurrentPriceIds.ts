import useAppSelector from 'hooks/useAppSelector'
import { getCurrentPlansByProduct } from 'state/billing/selectors'

export const useCurrentPlanIds = (): string[] => {
    const currentProducts = useAppSelector(getCurrentPlansByProduct)

    const currentPlanIds: string[] = currentProducts
        ? [
              currentProducts.helpdesk?.plan_id,
              currentProducts.automation?.plan_id || '',
              currentProducts.convert?.plan_id || '',
              currentProducts.voice?.plan_id || '',
              currentProducts.sms?.plan_id || '',
          ].filter(Boolean)
        : []

    return currentPlanIds
}
