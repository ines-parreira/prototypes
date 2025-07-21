import { ShopifyPermissionsData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useShopifyPermissionsData'

export class ShopifyPermissionsDataFixture {
    private readonly data: ShopifyPermissionsData

    private constructor() {
        this.data = {} as Partial<ShopifyPermissionsData> as any
    }

    static start() {
        return new ShopifyPermissionsDataFixture()
    }

    withIntegrationId(integrationId: number): this {
        this.data.integrationId = integrationId
        return this
    }

    withHasRequiredPermission(): this {
        this.data.hasRequiredPermissions = true
        return this
    }

    withMissingRequiredPermission(): this {
        this.data.hasRequiredPermissions = false
        return this
    }

    build(): ShopifyPermissionsData {
        return this.data
    }
}
