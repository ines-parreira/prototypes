import {useQueryClient} from '@tanstack/react-query'
import {
    accountConfigurationKeys,
    useUpsertAccountConfigurationPure,
} from '../../models/aiAgent/queries'

export const useUpsertAccountConfiguration = () => {
    const queryClient = useQueryClient()

    return useUpsertAccountConfigurationPure({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: accountConfigurationKeys.accountConfiguration(),
            })
        },
    })
}
