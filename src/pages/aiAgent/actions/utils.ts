import {ulid} from 'ulidx'

import {VisualBuilderGraphApp} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'

export const getInitialConfiguration = () => {
    const httpStepId = ulid()
    const httpStepVariableId = ulid()

    const b = new WorkflowConfigurationBuilder({
        id: ulid(),
        name: '',
        initialStep: {
            id: httpStepId,
            kind: 'http-request',
            settings: {
                url: '',
                method: 'GET',
                headers: {},
                name: '',
                variables: [
                    {
                        id: httpStepVariableId,
                        name: 'Request result',
                        jsonpath: '$',
                        data_type: null,
                    },
                ],
            },
        },
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [
                        {
                            description: '',
                            id: ulid(),
                            path: `steps_state.${httpStepId}.content.${httpStepVariableId}`,
                        },
                    ],
                },
            },
        ],
        available_languages: [],
    })

    return b.build()
}

export const getCredentialsStatus = (
    graphApp: VisualBuilderGraphApp | undefined,
    templateApp: {type: string},
    isTemplate: boolean
): {hasMissingCredentials: boolean; hasCredentials: boolean} => {
    const hasMissingCredentials =
        graphApp?.type === 'app' && !isTemplate && !graphApp.api_key?.trim()

    const hasCredentials =
        templateApp.type === 'app' && !isTemplate && !hasMissingCredentials

    return {
        hasMissingCredentials,
        hasCredentials,
    }
}
