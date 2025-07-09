import { useMutation } from '@tanstack/react-query'

export const useOptOutPlan = () => {
    const optOutPlanMutation = useMutation({
        mutationFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            return Promise.resolve()
        },
    })

    return {
        optOutPlan: optOutPlanMutation.mutate,
        optOutPlanAsync: optOutPlanMutation.mutateAsync,
        isLoading: optOutPlanMutation.isLoading,
        error: optOutPlanMutation.error,
        isSuccess: optOutPlanMutation.isSuccess,
        isError: optOutPlanMutation.isError,
    }
}
