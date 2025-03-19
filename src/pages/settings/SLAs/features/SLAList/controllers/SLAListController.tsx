import { useQueryClient } from '@tanstack/react-query'

import {
    HttpResponse,
    queryKeys,
    useUpdateSlaPolicy,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import Loader from 'pages/settings/SLAs/features/Loader/Loader'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import LandingPage from '../../LandingPage/LandingPage'
import SLAListView from '../views/SLAListView'
import useGetSLAPolicies from './useGetSLAPolicies'

export default function SLAListController() {
    const dispatch = useAppDispatch()
    const { data, isLoading, refetch: refetchSLAPolicies } = useGetSLAPolicies()
    const queryClient = useQueryClient()

    const SLAPolicies = data || []

    const hasSLAs = SLAPolicies && SLAPolicies?.length > 0

    const { mutateAsync: updateSLA, isLoading: isSubmitting } =
        useUpdateSlaPolicy({
            mutation: {
                onMutate: async ({ id, data: { active } }) => {
                    if (active !== undefined) {
                        const queryKey = queryKeys.slaPolicies.listSlaPolicies()
                        await queryClient.cancelQueries({
                            queryKey,
                        })

                        const previousPolicies =
                            queryClient.getQueryData(queryKey)

                        queryClient.setQueryData<
                            HttpResponse<ReturnType<typeof useGetSLAPolicies>>
                        >(queryKey, (oldQueryResponse) => {
                            if (oldQueryResponse?.data?.data) {
                                return {
                                    ...oldQueryResponse,
                                    data: {
                                        ...oldQueryResponse.data,
                                        data: oldQueryResponse?.data.data.map(
                                            (policy) =>
                                                policy.uuid !== id
                                                    ? policy
                                                    : {
                                                          ...policy,
                                                          deactivated_datetime:
                                                              active
                                                                  ? null
                                                                  : new Date().toISOString(),
                                                      },
                                        ),
                                    },
                                }
                            }
                        })

                        return { previousPolicies }
                    }
                },
                onSettled: (_, error, variables, context) => {
                    if (variables.data.active !== undefined) {
                        const queryKey = queryKeys.slaPolicies.listSlaPolicies()

                        if (error) {
                            queryClient.setQueryData(
                                queryKey,
                                context?.previousPolicies,
                            )
                        }
                        void queryClient.invalidateQueries({
                            queryKey,
                        })
                    }
                },
            },
        })

    const togglePolicy = (id: string, active: boolean) => {
        void (async function () {
            try {
                await updateSLA({ id, data: { active } })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'SLA policy toggled',
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Failed to toggle SLA policy`,
                    }),
                )
            }
        })()
    }

    const changePolicyPriority = (id: string, priority: number) => {
        void (async function () {
            try {
                await updateSLA({ id, data: { priority: String(priority) } })
                void refetchSLAPolicies()
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `Failed to change SLA policy priority`,
                    }),
                )
            }
        })()
    }

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : hasSLAs ? (
                <SLAListView
                    data={SLAPolicies}
                    onTogglePolicy={togglePolicy}
                    onPolicyPriorityChange={changePolicyPriority}
                    isSubmitting={isSubmitting}
                />
            ) : (
                <LandingPage />
            )}
        </>
    )
}
