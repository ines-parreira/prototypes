import { getStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

/**
 * Custom hook to check if the current account has a single store
 * @returns boolean indicating if the account has exactly one store integration
 */
export const useIsSingleStore = (): boolean => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    return Boolean(storeIntegrations && storeIntegrations.length === 1)
}

export default useIsSingleStore
