import {useQueryClient} from '@tanstack/react-query'

import {
    useDeleteWorkflowConfigurationTemplate,
    workflowsConfigurationTemplateDefinitionKeys,
} from 'models/workflows/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

const useDeleteActionTemplate = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const queryKey = workflowsConfigurationTemplateDefinitionKeys.all()

    const {mutateAsync, isLoading} = useDeleteWorkflowConfigurationTemplate({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully deleted',
                })
            )
        },
    })

    return {isLoading, deleteActionTemplate: mutateAsync}
}

export default useDeleteActionTemplate
