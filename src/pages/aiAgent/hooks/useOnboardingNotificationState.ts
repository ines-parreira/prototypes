import { useGetOrCreateOnboardingNotificationState } from 'models/aiAgent/queries'

type Params = {
    accountDomain: string
    shopName: string | undefined
    enabled?: boolean
}

export const useOnboardingNotificationState = ({
    accountDomain,
    shopName,
    enabled,
}: Params) => {
    const {
        data: onboardingNotificationStateData,
        isLoading: isOnboardingNotificationStateLoading,
    } = useGetOrCreateOnboardingNotificationState(
        {
            accountDomain,
            storeName: shopName,
        },
        {
            retry: 1,
            refetchOnWindowFocus: false,
            enabled: enabled ?? true,
        },
    )

    return {
        isLoading: isOnboardingNotificationStateLoading,
        onboardingNotificationState:
            onboardingNotificationStateData?.data.onboardingNotificationState,
    }
}
