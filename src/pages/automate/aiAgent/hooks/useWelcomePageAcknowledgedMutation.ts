import {useQueryClient} from '@tanstack/react-query'
import {
    getWelcomePageAcknowledgedKey,
    useCreateWelcomePageAcknowledged,
} from 'models/aiAgent/queries'

export const useWelcomePageAcknowledgedMutation = ({
    shopName,
}: {
    shopName: string
}) => {
    const queryClient = useQueryClient()

    const {isLoading, mutateAsync: createWelcomePageAcknowledged} =
        useCreateWelcomePageAcknowledged({
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: getWelcomePageAcknowledgedKey(shopName),
                })
            },
        })

    return {
        isLoading,
        createWelcomePageAcknowledged,
    }
}
