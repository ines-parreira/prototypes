import useAppSelector from 'hooks/useAppSelector'
import { useGetStoreConfigurationPure } from 'models/aiAgent/queries'
import { useGetPostStoreInstallationStepsPure } from 'models/aiAgentPostStoreInstallationSteps/queries'
import { PostStoreInstallationStepType } from 'models/aiAgentPostStoreInstallationSteps/types'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import {
    getCurrentAccountId,
    getCurrentDomain,
} from 'state/currentAccount/selectors'

export const useAiAgentOverviewModeEnabled = (
    shopName: string,
    shopType: string,
    enabled?: boolean,
) => {
    const accountDomain = useAppSelector(getCurrentDomain)
    const currentAccountId = useAppSelector(getCurrentAccountId)

    const { data: storeData, isFetching: isStoreDataLoading } =
        useGetStoreConfigurationPure(
            {
                accountDomain,
                storeName: shopName,
            },
            { enabled, retry: 1, refetchOnWindowFocus: false },
        )

    const { data, isFetching: isPostStoreInstallationStepsLoading } =
        useGetPostStoreInstallationStepsPure(
            {
                accountId: currentAccountId,
                shopName: shopName,
                shopType: shopType,
            },
            { enabled, retry: 1, refetchOnWindowFocus: false },
        )

    const isLoading = isStoreDataLoading || isPostStoreInstallationStepsLoading

    if (isLoading || !enabled || !storeData) {
        return { isAiAgentLiveModeEnabled: null, isLoading }
    }

    const isAiAgentEnabled = isAiAgentEnabledForStore(
        storeData.data?.storeConfiguration,
    )
    const postOnboardingStep = data?.postStoreInstallationSteps?.find(
        (s) => s.type === PostStoreInstallationStepType.POST_ONBOARDING,
    )
    const isPostOnboardingDone = !!postOnboardingStep?.completedDatetime

    return {
        isAiAgentLiveModeEnabled: isAiAgentEnabled || isPostOnboardingDone,
        isLoading: false,
    }
}
