import {useQueryClient} from '@tanstack/react-query'

import {
    channelConnectionKeys,
    useUpdateChannelConnection as usePureUpdateChannelConnection,
} from 'models/convert/channelConnection/queries'

export const useUpdateChannelConnection = () => {
    const queryClient = useQueryClient()

    return usePureUpdateChannelConnection({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: channelConnectionKeys.lists(),
            })
        },
    })
}
