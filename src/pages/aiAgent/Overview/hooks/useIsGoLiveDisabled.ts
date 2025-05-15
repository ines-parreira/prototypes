import { useBillingState } from 'models/billing/queries'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { useFetchEmailIntegrationsData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchEmailIntegrationsData'
import { useFetchFaqHelpCentersData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchFaqHelpCentersData'

const checkEmailVerification = (
    emailIds: number[],
    emailIntegrationsData?: { id: number; isVerified: boolean }[],
): boolean => {
    if (!emailIds.length) {
        return true
    }

    return emailIds.every((id) =>
        emailIntegrationsData?.some(
            (email) => email.id === id && email.isVerified,
        ),
    )
}

export const useIsGoLiveDisabled = (
    shopName?: string | null,
): { isLoading: boolean; isDisabled: boolean } => {
    const { data, isLoading } = useGetOnboardingDataByShopName({
        shopName: shopName ?? '',
        enabled: !!shopName,
    })

    const chatIds = data?.chatIntegrationIds ?? []
    const emailIds = data?.emailIntegrationIds ?? []

    const chatIntegrationsStatusData = useFetchChatIntegrationsStatusData()

    const billingState = useBillingState({ enabled: true })

    const { isLoading: faqHelpCentersDataIsLoading, data: faqHelpCentersData } =
        useFetchFaqHelpCentersData({ enabled: true })

    const { data: emailIntegrationsData } = useFetchEmailIntegrationsData()

    if (isLoading || faqHelpCentersDataIsLoading) {
        return { isLoading: true, isDisabled: true }
    }

    const areChatInstalledProperly =
        !chatIds.length ||
        (chatIds.length && chatIntegrationsStatusData?.length)

    const areEmailsVerified = checkEmailVerification(
        emailIds,
        emailIntegrationsData,
    )

    const isOnNewPlan =
        billingState?.data?.current_plans?.automate?.generation === 6

    return {
        isLoading: false,
        isDisabled:
            !areChatInstalledProperly ||
            !areEmailsVerified ||
            !isOnNewPlan ||
            !faqHelpCentersData?.length,
    }
}
