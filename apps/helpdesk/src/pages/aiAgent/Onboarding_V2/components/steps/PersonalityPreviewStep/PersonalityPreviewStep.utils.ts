import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

export const mapScopeToPreviewType = (scope: AiAgentScopes[]) => {
    if (scope.length === 1 && scope.includes(AiAgentScopes.SALES)) {
        return 'sales' as const
    }

    if (scope.length === 1 && scope.includes(AiAgentScopes.SUPPORT)) {
        return 'support' as const
    }

    return 'mixed' as const
}
