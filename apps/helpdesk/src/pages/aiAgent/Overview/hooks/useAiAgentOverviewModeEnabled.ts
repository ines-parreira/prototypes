import useAppSelector from 'hooks/useAppSelector'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

import { useIsAiAgentDuringDeployment } from './useIsAiAgentDuringDeployment'

export const useAiAgentOverviewModeEnabled = (
    shopName: string,
    shopType: string,
    enabled?: boolean,
) => {
    const [isAiAgentDuringDeployment] = useIsAiAgentDuringDeployment()

    const currentAccountId = useAppSelector(getCurrentAccountId)

    const { storeConfiguration, isLoading: isStoreDataLoading } =
        useAiAgentStoreConfigurationContext()

    const { data, isLoading: isPostStoreInstallationStepsLoading } =
        useGetPostStoreInstallationStepsPure(
            {
                accountId: currentAccountId,
                shopName: shopName,
                shopType: shopType,
            },
            { enabled, retry: 1, refetchOnWindowFocus: false },
        )

    const isLoading = isStoreDataLoading || isPostStoreInstallationStepsLoading

    if (isLoading || !enabled || !storeConfiguration) {
        return { isAiAgentLiveModeEnabled: null, isLoading }
    }

    const isAiAgentEnabled = isAiAgentEnabledForStore(storeConfiguration)

    const postOnboardingStep = data?.postStoreInstallationSteps?.find(
        (s) => s.type === PostStoreInstallationStepType.POST_ONBOARDING,
    )
    const isPostOnboardingDone = !!postOnboardingStep?.completedDatetime

    return {
        isAiAgentLiveModeEnabled:
            !isAiAgentDuringDeployment &&
            (isAiAgentEnabled || isPostOnboardingDone),
        isLoading: false,
    }
}
