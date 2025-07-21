import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    actionsAppDefinitionKeys,
    useUpsertActionsApp,
} from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useCreateActionsApp = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const queryKey = actionsAppDefinitionKeys.all()

    const { mutateAsync, isLoading } = useUpsertActionsApp({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully created',
                }),
            )
        },
    })

    return { isLoading, createActionsApp: mutateAsync }
}

export default useCreateActionsApp
