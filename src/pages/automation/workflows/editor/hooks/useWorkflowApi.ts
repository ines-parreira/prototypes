import {useCallback} from 'react'
import {ulid} from 'ulidx'

export type MessageContent = {
    html: string
    text: string
}

export type WorkflowConfiguration = {
    id: string
    name: string
    initial_step_id: string
    steps: Array<
        | {
              id: string
              kind: 'messages'
              settings: {
                  messages: Array<{
                      content: MessageContent
                  }>
                  author: {
                      kind: 'bot'
                  }
              }
          }
        | {
              id: string
              kind: 'choices'
              settings: {
                  choices: Array<{
                      event_id: string
                      label: string
                  }>
              }
          }
    >
    transitions: Array<{
        from_step_id: string
        to_step_id: string
        event?: Maybe<{
            id: string
            kind: 'choices'
        }>
    }>
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

export const workflowConfigurationFactory: (
    workflowId: string
) => WorkflowConfiguration = (workflowId: string) => {
    const initial_step_id = ulid()
    return {
        id: workflowId,
        name: '',
        initial_step_id,
        steps: [
            {
                id: initial_step_id,
                kind: 'messages',
                settings: {
                    messages: [{content: {html: '', text: ''}}],
                    author: {kind: 'bot'},
                },
            },
        ],
        transitions: [],
    }
}
