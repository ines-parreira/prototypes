import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useUpsertWorkflowConfigurationTemplate,
    workflowsConfigurationTemplateDefinitionKeys,
} from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useEditActionTemplate = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const queryKey = workflowsConfigurationTemplateDefinitionKeys.all()

    const { mutateAsync, isLoading } = useUpsertWorkflowConfigurationTemplate({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully updated',
                }),
            )
        },
    })

    return { isLoading, editActionTemplate: mutateAsync }
}

export default useEditActionTemplate
