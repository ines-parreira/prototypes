import {IntegrationType} from 'models/integration/constants'
import {
    WorkflowConfiguration,
    WorkflowStepMessages,
    WorkflowTransition,
} from 'pages/automation/workflows/models/workflowConfiguration.types'

export function mockWorkflowConfiguration(uid: string): WorkflowConfiguration {
    return {
        id: uid,
        account_id: 1,
        internal_id: `int-${uid}`,
        name: uid,
        is_draft: false,
        initial_step_id: 's1',
        steps: [] as WorkflowStepMessages[],
        transitions: [] as WorkflowTransition[],
        available_languages: [],
    }
}

export function getIntegration(
    id: number,
    type: IntegrationType,
    shopName?: string
) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
            shop_name: shopName,
        },
    }
}
