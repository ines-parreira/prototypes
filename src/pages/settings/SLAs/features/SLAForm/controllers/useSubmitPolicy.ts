import {
    queryKeys,
    useCreateSlaPolicy,
    useUpdateSlaPolicy,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'
import {useParams} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import handleApiError from 'pages/settings/SLAs/utils/handleApiError'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import makeCreateSLAPolicyBody from './makeCreateSLAPolicyBody'
import {SLAFormValues} from './useFormValues'

export default function useSubmitPolicy() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const {policyId} = useParams<{policyId?: string}>()
    const isNewPolicy = policyId === 'new'

    const {mutateAsync: createSLA, isLoading: isCreating} = useCreateSlaPolicy()
    const {mutateAsync: updateSLA, isLoading: isUpdating} = useUpdateSlaPolicy()

    const save = useCallback(
        async (data: SLAFormValues) => {
            const body = makeCreateSLAPolicyBody(data)
            try {
                isNewPolicy
                    ? await createSLA({data: body})
                    : await updateSLA({id: policyId!, data: body})

                void (await dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `SLA policy ${
                            isNewPolicy ? 'created' : 'updated'
                        }`,
                    })
                ))
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slaPolicies.listSlaPolicies(),
                })
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slaPolicies.getSlaPolicy(policyId),
                })
                history.push('/app/settings/sla')
            } catch (e) {
                const apiErrorMessage = handleApiError(e as Error)
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            apiErrorMessage ||
                            `Failed to ${
                                isNewPolicy ? 'create' : 'update'
                            } SLA policy.`,
                        allowHTML: true,
                    })
                )
            }
        },
        [createSLA, dispatch, isNewPolicy, policyId, queryClient, updateSLA]
    )

    return {save, isLoading: isCreating || isUpdating || false}
}
