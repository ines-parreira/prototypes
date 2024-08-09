import {useQueryClient} from '@tanstack/react-query'

import {
    actionsAppDefinitionKeys,
    useUpsertActionsApp,
} from 'models/workflows/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const useEditActionsApp = (id: string) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const queryKey = actionsAppDefinitionKeys.get(id)

    const {mutateAsync, isLoading} = useUpsertActionsApp({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully updated',
                })
            )
        },
    })

    return {isLoading, editActionsApp: mutateAsync}
}

export default useEditActionsApp
