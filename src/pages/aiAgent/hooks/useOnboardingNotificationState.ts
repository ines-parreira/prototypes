import {useGetOnboardingNotificationState} from 'models/aiAgent/queries'

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
    } = useGetOnboardingNotificationState(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    return {
        isLoading: isOnboardingNotificationStateLoading,
        onboardingNotificationState:
            onboardingNotificationStateData?.data.onboardingNotificationState,
    }
}
