import { Integration } from 'models/integration/types'
import { ShopType } from 'models/selfServiceConfiguration/types'

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
    order_management: { enabled: true },
    workflows: workflowsEntrypointsFixture.map(({ workflow_id, enabled }) => ({
        id: workflow_id,
        enabled,
    })),
}

export const selfServiceConfigurationFixture = {
    id: 1,
    type: 'shopify' as ShopType,
    shopName: 'acme',
    createdDatetime: '2023-02-21T19:21:06.804Z',
    updatedDatetime: '2023-02-21T19:21:06.804Z',
    deletedDatetime: null,
    reportIssuePolicy: {
        cases: [],
        enabled: true,
    },
    trackOrderPolicy: { enabled: true },
    cancelOrderPolicy: {
        eligibilities: [],
        enabled: true,
        exceptions: [],
        createdDatetime: '2023-02-21T19:21:06.804Z',
        deactivatedDatetime: null,
        id: 1,
    },
    returnOrderPolicy: {
        eligibilities: [],
        enabled: true,
        exceptions: [],
        shop_name: 'acme',
    },
    articleRecommendationHelpCenterId: 22,
    workflowsEntrypoints: [
        {
            workflow_id: 'workflow_id_1',
        },
        {
            workflow_id: 'workflow_id_2',
        },
    ],
}
