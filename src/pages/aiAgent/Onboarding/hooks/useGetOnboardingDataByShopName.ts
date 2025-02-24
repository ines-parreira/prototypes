import {useQuery} from '@tanstack/react-query'

import {getOnboardingDataByShopName} from 'models/aiAgent/resources/configuration'
import {OnboardingData} from 'models/aiAgent/types'

export const useGetOnboardingDataByShopName = (shopName: string) => {
    return useQuery({
        queryKey: ['onboardingData', 'shopName', shopName],
        queryFn: async () => {
            const data = await getOnboardingDataByShopName(shopName)
            const selectedShopData = data.find(
                (item: OnboardingData) => item.shopName === shopName
            )
            if (shopName && selectedShopData) {
                return selectedShopData
            }
            return null
        },
        staleTime: Infinity,
    })
}
