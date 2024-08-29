import {useGetWelcomePageAcknowledged} from 'models/aiAgent/queries'

export const useWelcomePageAcknowledged = ({shopName}: {shopName: string}) => {
    const {isLoading, data} = useGetWelcomePageAcknowledged(shopName, {
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return {
        isLoading,
        data: data?.data,
    }
}
