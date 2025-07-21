import { useQueryClient } from '@tanstack/react-query'

import {
    convertSettingsKeys,
    useUpdateSetting as usePureUpdateSetting,
} from 'models/convert/settings/queries'

export const useUpdateSetting = () => {
    const queryClient = useQueryClient()

    return usePureUpdateSetting({
        onSuccess: (_, [, params]) => {
            void queryClient.invalidateQueries({
                queryKey: convertSettingsKeys.list(params),
            })
        },
    })
}
