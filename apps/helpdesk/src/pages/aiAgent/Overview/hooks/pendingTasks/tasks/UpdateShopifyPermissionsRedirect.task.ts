import type { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'
import { Task } from './Task'

export class UpdateShopifyPermissionsRedirectTask extends Task {
    public readonly taskType = 'UpdateShopifyPermissionsRedirectTask'

    constructor(data: RuleEngineData, routes: RuleEngineRoutes) {
        super(
            'Update Shopify permissions',
            'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
            'RECOMMENDED',
            data,
            routes,
        )
    }

    protected isAvailable(data: RuleEngineData): boolean {
        return !!data?.shopifyIntegration
    }

    // Shopify integration must have required scope
    protected shouldBeDisplayed({
        shopifyIntegration,
    }: RuleEngineData): boolean {
        return !shopifyIntegration?.hasRequiredPermissions
    }

    protected getFeatureUrl({
        data: { shopifyIntegration },
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string {
        return `/app/settings/integrations/shopify/${shopifyIntegration?.integrationId}`
    }

    protected getIsCheckedAutomatically(): boolean {
        return true
    }
}
