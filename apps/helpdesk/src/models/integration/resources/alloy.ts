import client from '@repo/api-resources'

import type { AlloyInitInfo } from 'models/integration/types/alloy'

export async function loadIntegration(
    integrationId: string,
): Promise<AlloyInitInfo> {
    const resp = await client.get<AlloyInitInfo>(
        `/integrations/alloy/${integrationId}/init`,
    )
    return resp.data
}
