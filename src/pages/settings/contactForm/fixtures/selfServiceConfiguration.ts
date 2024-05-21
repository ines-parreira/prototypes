import {Integration} from 'models/integration/types'
import {ShopType} from 'models/selfServiceConfiguration/types'

export const shopifyShopIntegrationFixture = {
    type: 'shopify' as ShopType,
    name: 'acme',
} as Integration

export const workflowsEntrypointsFixture = [
    {
        workflow_id: 'workflow_id_1',
        enabled: false,
    },
    {
        workflow_id: 'workflow_id_2',
        enabled: false,
    },
]

export const automationSettingsFixture = {
    order_management: {enabled: true},
    workflows: workflowsEntrypointsFixture.map(({workflow_id, enabled}) => ({
        id: workflow_id,
        enabled,
    })),
}

export const selfServiceConfigurationFixture = {
    id: 1,
    type: 'shopify' as ShopType,
    shop_name: 'acme',
    created_datetime: '2023-02-21T19:21:06.804Z',
    updated_datetime: '2023-02-21T19:21:06.804Z',
    deactivated_datetime: null,
    report_issue_policy: {
        cases: [],
        enabled: true,
    },
    track_order_policy: {enabled: true},
    cancel_order_policy: {
        eligibilities: [],
        enabled: true,
        exceptions: [],
        created_datetime: '2023-02-21T19:21:06.804Z',
        deactivated_datetime: null,
        id: 1,
    },
    return_order_policy: {
        eligibilities: [],
        enabled: true,
        exceptions: [],
        shop_name: 'acme',
    },
    quick_response_policies: [],
    article_recommendation_help_center_id: 22,
    workflows_entrypoints: [
        {
            workflow_id: 'workflow_id_1',
        },
        {
            workflow_id: 'workflow_id_2',
        },
    ],
}
