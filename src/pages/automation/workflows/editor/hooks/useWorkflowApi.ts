import {useCallback} from 'react'

export type WorkflowConfiguration = {
    id: string
    name: string
}

// waiting for the actual configuration API we use local storage to persist configurations

type WorkflowApi = {
    fetchWorkflowConfiguration: (
        id: string
    ) => Promise<Maybe<WorkflowConfiguration>>
    upsertWorkflowConfiguration: (
        data: WorkflowConfiguration
    ) => Promise<WorkflowConfiguration>
    workflowConfigurationFactory: (workflowId: string) => WorkflowConfiguration
}

export default function useWorkflowApi(): WorkflowApi {
    return {
        fetchWorkflowConfiguration: useCallback((id: string) => {
            return Promise.resolve(
                JSON.parse(localStorage.getItem(`gorgias-workflow-${id}`)!)
            )
        }, []),
        upsertWorkflowConfiguration: useCallback(
            (data: WorkflowConfiguration) => {
                localStorage.setItem(
                    `gorgias-workflow-${data.id}`,
                    JSON.stringify(data)
                )
                return Promise.resolve(data)
            },
            []
        ),
        workflowConfigurationFactory,
    }
}

export const workflowConfigurationFactory = (workflowId: string) => ({
    id: workflowId,
    name: '',
})
