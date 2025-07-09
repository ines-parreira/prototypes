import { StoreConfiguration } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { atLeastOneStoreHasActiveTrial } from 'pages/aiAgent/trial/utils/utils'

export const useIsTrialStarted = ({
    storeConfiguration,
}: {
    storeConfiguration?: StoreConfiguration
}) => {
    const trialMilestone = useSalesTrialRevampMilestone()
    const { storeActivations } = useStoreActivations()

    if (!storeConfiguration || Object.keys(storeActivations).length === 0) {
        return false
    }

    const selectedStoreActivation =
        storeActivations[storeConfiguration.storeName]

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const hasActiveTrial = atLeastOneStoreHasActiveTrial(
        [storeConfiguration],
        isRevampTrialMilestone1Enabled,
        {
            [storeConfiguration.storeName]: selectedStoreActivation,
        },
    )

    return hasActiveTrial
}
