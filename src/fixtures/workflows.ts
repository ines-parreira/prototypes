import {WorkflowConfigurationShallow} from '../pages/automate/workflows/models/workflowConfiguration.types'

export const createWorkflowConfigurationShallow = (
    id: string,
    props?: Partial<WorkflowConfigurationShallow>
): WorkflowConfigurationShallow => ({
    id,
    available_languages: ['en-US'],
    internal_id: '0',
    is_draft: false,
    name: 'wf 1',
    initial_step_id: '0',
    steps: [],
    created_datetime: '',
    updated_datetime: '',
    deleted_datetime: '',
    ...props,
})
