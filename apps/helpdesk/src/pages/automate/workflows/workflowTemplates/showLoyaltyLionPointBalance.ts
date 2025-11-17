import { ulid } from 'ulidx'

import { WorkflowConfigurationBuilder } from '../models/workflowConfiguration.model'
import type {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import { WorkflowTemplateLabelType } from '../models/workflowConfiguration.types'

export const SHOW_LOYALTY_LION_POINT_BALANCE: WorkflowTemplate = {
    slug: 'show-loyalty-lion-point-balance',
    name: 'Show LoyaltyLion points balance',
    description: 'Requires HTTP request set up and LoyaltyLion account.',
    label: WorkflowTemplateLabelType.ThirdPartyActions,
    getConfiguration: (
        id: string,
        integrationId: number,
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Show LoyaltyLion points balance',
            entrypoint: {
                label: 'How many loyalty points do I have?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'shopper-authentication',
                settings: {
                    integration_id: integrationId,
                },
            },
        })
        const shopperAuthenticationStepId = b.selection.id
        b.insertOrderSelectionStepAndSelect({
            message: {
                content: {
                    html: '<div>Please select an order associated with your account.</div>',
                    text: 'Please select an order associated with your account.',
                },
            },
        })
        const pointsApprovedVariableId = ulid()
        const pointsSpentVariableId = ulid()
        const rewardsClaimedVariableId = ulid()
        b.insertHttpRequestStepAndSelect({
            name: 'Loyalty point balance (make sure credentials are added)',
            url: `https://api.loyaltylion.com/v2/customers?email={{steps_state.${shopperAuthenticationStepId}.customer.email}}`,
            method: 'GET',
            headers: {
                blank: '',
                authorization: 'Basic [your base64-encoded credentials]',
                'gorgias-message':
                    'To enable this flow, make sure to follow all steps mentioned above',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
                'setup-instructions-1':
                    'Get your <token>:<secret> value as mentioned on https://developers.loyaltylion.com/api/authentication/token-secret/',
                'setup-instructions-2':
                    'Encode your <token>:<secret> using base64 encoding. You can use this tool: https://www.base64encode.org/',
                'setup-instructions-3':
                    'Get value on step 2 and replace for [your base64-encoded credentials] on "Authorization" header',
                'setup-instructions-4':
                    'Remove all "setup instructions" headers',
            },
            variables: [
                {
                    id: pointsApprovedVariableId,
                    name: 'points_approved',
                    jsonpath: '$.customers[0].points_approved',
                    data_type: 'number',
                },
                {
                    id: pointsSpentVariableId,
                    name: 'points_spent',
                    jsonpath: '$.customers[0].points_spent',
                    data_type: 'number',
                },
                {
                    id: rewardsClaimedVariableId,
                    name: 'rewards_claimed',
                    jsonpath: '$.customers[0].rewards_claimed',
                    data_type: 'number',
                },
            ],
        })
        const httpRequestStepId = b.selection.id
        b.insertHttpRequestConditionAndMessageStepAndSelect('success', {
            content: {
                html: `<div>Here&#x27;s your point balance:</div><div>- Points spent: {{steps_state.${httpRequestStepId}.content.${pointsSpentVariableId}}} </div><div>- Available points: {{steps_state.${httpRequestStepId}.content.${pointsApprovedVariableId}}} </div><div>- Rewards claimed: {{steps_state.${httpRequestStepId}.content.${rewardsClaimedVariableId}}} </div>`,
                text: `Here's your point balance:
- Points spent: {{steps_state.${httpRequestStepId}.content.${pointsSpentVariableId}}}
- Available points: {{steps_state.${httpRequestStepId}.content.${pointsApprovedVariableId}}}
- Rewards claimed: {{steps_state.${httpRequestStepId}.content.${rewardsClaimedVariableId}}} `,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertHttpRequestConditionAndHandOverStepAndSelect('error')
        return b.build()
    },
}
