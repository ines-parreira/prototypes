import { useCallback } from 'react'

import { history } from '@repo/routing'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import {
    queryKeys,
    useCreateSlaPolicy,
    useUpdateSlaPolicy,
} from '@gorgias/helpdesk-queries'

import handleApiError from 'pages/settings/SLAs/utils/handleApiError'

import makeCreateSLAPolicyBody from './makeCreateSLAPolicyBody'
import type { SLAFormValues } from './useFormValues'

export default function useSubmitPolicy() {
    const queryClient = useQueryClient()

    const { policyId } = useParams<{ policyId?: string }>()
    const isNewPolicy = policyId === 'new'

    const { mutateAsync: createSLA, isLoading: isCreating } =
        useCreateSlaPolicy()
    const { mutateAsync: updateSLA, isLoading: isUpdating } =
        useUpdateSlaPolicy()

    const save = useCallback(
        async (data: SLAFormValues) => {
            const body = makeCreateSLAPolicyBody(data)
            try {
                isNewPolicy
                    ? await createSLA({ data: body })
                    : await updateSLA({ id: policyId!, data: body })

                toast.success(
                    `SLA policy ${isNewPolicy ? 'created' : 'updated'}`,
                )
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slaPolicies.listSlaPolicies(),
                })
                if (policyId && policyId !== 'new') {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.slaPolicies.getSlaPolicy(policyId),
                    })
                }
                history.push('/app/settings/sla')
            } catch (e) {
                const apiErrorMessage = handleApiError(e as Error)
                toast.error(
                    apiErrorMessage ||
                        `Failed to ${
                            isNewPolicy ? 'create' : 'update'
                        } SLA policy.`,
                )
            }
        },
        [createSLA, isNewPolicy, policyId, queryClient, updateSLA],
    )

    return { save, isLoading: isCreating || isUpdating || false }
}
