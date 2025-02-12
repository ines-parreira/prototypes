import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'
import {Task} from './Task'

export class UpdateShopifyPermissionsTask extends Task {
    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Update Shopify permissions',
            'This will give AI Agent access to specific Shopify information',
            'RECOMMENDED',
            data,
            routes
        )
    }

    // Shopify integration must have required scope
    protected shouldBeDisplayed({shopifyIntegration}: RuleEngineData): boolean {
        return !shopifyIntegration.hasRequiredPermissions
    }

    protected getFeatureUrl({shopifyIntegration}: RuleEngineData): string {
        return `/api/integrations/${shopifyIntegration.integrationId}/sync_permissions`
    }
}
