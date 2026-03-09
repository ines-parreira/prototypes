import type { BaseIntegration } from '@gorgias/helpdesk-types'

export function resolveActionExecutedIntegration(
    integrations: BaseIntegration[] | undefined,
    integrationId: string | number | null | undefined,
): BaseIntegration | null {
    if (!integrations?.length || integrationId == null) {
        return null
    }

    return (
        integrations.find(
            (integration) => String(integration.id) === String(integrationId),
        ) ?? null
    )
}
