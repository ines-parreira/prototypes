import { ulid } from 'ulidx'

import { WorkflowConfiguration } from '../models/workflowConfiguration.types'

export const workflowConfigurationFactory = (
    workflowId: string,
): WorkflowConfiguration => {
    const messageStepId = ulid()
    const helpfulPromptStepId = ulid()
    return {
        id: workflowId,
        internal_id: ulid(),
        is_draft: true,
        name: '',
        initial_step_id: messageStepId,
        available_languages: ['en-US'],
        entrypoint: {
            label: '',
            label_tkey: ulid(),
        },
        steps: [
            {
                id: messageStepId,
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            text: '',
                            text_tkey: ulid(),
                            html: '',
                            html_tkey: ulid(),
                        },
                    },
                },
            },
            {
                id: helpfulPromptStepId,
                kind: 'helpful-prompt',
            },
        ],
        transitions: [
            {
                id: ulid(),
                from_step_id: messageStepId,
                to_step_id: helpfulPromptStepId,
            },
        ],
    }
}
