import {useGetOrCreateOnboardingNotificationState} from 'models/aiAgent/queries'

type Params = {
    accountDomain: string
    shopName: string
}

export const useOnboardingNotificationState = ({
    accountDomain,
    shopName,
}: Params) => {
    const {
        data: onboardingNotificationStateData,
        isLoading: isOnboardingNotificationStateLoading,
    } = useGetOrCreateOnboardingNotificationState(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false, enabled: !!shopName}
    )

    return {
        isLoading: isOnboardingNotificationStateLoading,
        onboardingNotificationState:
            onboardingNotificationStateData?.data.onboardingNotificationState,
    }
}
