import { useGetWorkflowConfiguration } from 'models/workflows/queries'

type Params = {
    workflowId: string
    enabled: boolean
}

/**
 * Lazy workflow-configuration fetch for support-action hover previews.
 * Disabled until the popover opens, in line with the other reference cards.
 */
export function useSupportActionReferenceData({ workflowId, enabled }: Params) {
    const { data, isLoading, isError } = useGetWorkflowConfiguration(
        workflowId,
        {
            enabled,
        },
    )

    return {
        configuration: data,
        isLoading: enabled && isLoading,
        isError,
    }
}
