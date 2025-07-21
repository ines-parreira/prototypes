import {
    buildRuleEngineData,
    buildRuleEngineRoutes,
} from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/tests/utils'
import { ShopifyPermissionsDataFixture } from 'pages/aiAgent/Overview/hooks/pendingTasks/tests/ShopifyPermissionsData.fixture'

import { UpdateShopifyPermissionsTask } from '../UpdateShopifyPermissions.task'

describe('UpdateShopifyPermissionsTask', () => {
    it('should display the task if Shopify permissions are required', () => {
        const task = new UpdateShopifyPermissionsTask(
            buildRuleEngineData({
                shopifyIntegration: ShopifyPermissionsDataFixture.start()
                    .withIntegrationId(123)
                    .withMissingRequiredPermission()
                    .build(),
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(true)
    })

    it('should not display the task if no Shopify permissions are required', () => {
        const task = new UpdateShopifyPermissionsTask(
            buildRuleEngineData({
                shopifyIntegration: ShopifyPermissionsDataFixture.start()
                    .withIntegrationId(123)
                    .withHasRequiredPermission()
                    .build(),
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.display).toBe(false)
    })

    it('should return the feature url', () => {
        const task = new UpdateShopifyPermissionsTask(
            buildRuleEngineData({
                shopifyIntegration: ShopifyPermissionsDataFixture.start()
                    .withIntegrationId(123)
                    .withHasRequiredPermission()
                    .build(),
            }),
            buildRuleEngineRoutes(),
        )

        expect(task.featureUrl).toBe('/api/integrations/123/sync_permissions')
    })
})
