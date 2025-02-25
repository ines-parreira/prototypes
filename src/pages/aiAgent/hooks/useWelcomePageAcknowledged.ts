import { useGetWelcomePageAcknowledged } from 'models/aiAgent/queries'

export const useWelcomePageAcknowledged = ({
    accountDomain,
    shopName,
}: {
    accountDomain: string
    shopName: string
}) => {
    const { isLoading, data } = useGetWelcomePageAcknowledged(
        accountDomain,
        shopName,
        {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    )

    return {
        isLoading,
        data: data?.data,
    }
}
