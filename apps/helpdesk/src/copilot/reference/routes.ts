import type { GorgiasCopilotReference } from '@gorgias/copilot'

export function resolveReferenceRoute(
    reference: GorgiasCopilotReference,
): string | null {
    switch (reference.type) {
        case 'ticket':
            return `/app/ticket/${reference.id}`
        case 'guidance':
            return `/app/ai-agent/${reference.shopType}/${reference.shopName}/knowledge/guidance/${reference.id}`
        case 'skill':
            return `/app/ai-agent/${reference.shopType}/${reference.shopName}/skills/${reference.id}`
        case 'opportunity':
            return `/app/ai-agent/${reference.shopType}/${reference.shopName}/opportunities/${reference.id}`
        case 'support-action':
            return `/app/ai-agent/${reference.shopType}/${reference.shopName}/actions/edit/${reference.id}`
    }
}
