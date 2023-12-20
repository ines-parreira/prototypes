import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'

const useIsAutomateSubscriber = (
    integration: GorgiasChatIntegration
): boolean => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const shopName = integration.meta?.shop_name as string | null
    const shopType = integration.meta?.shop_type as string | null

    return Boolean(hasAutomate && shopName && shopType)
}

export default useIsAutomateSubscriber
